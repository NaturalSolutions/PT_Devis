using JWT;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Principal;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace Position_WebAPI
{
    public static class RoleManager
    {
        public static Dictionary<int, string> zeRoles = null;
        public static string _connectionString = "";
        public static void InitRoles(string ConnectionString)
        {
            _connectionString = ConnectionString;
            //DBCnx myConn = new SqlCnx(_connectionString);
            //zeRoles = myConn.GetIntDicFromQuery("select distinct U.TUse_PK_ID,R.TRol_Label from tusers U JOIN TAutorisations A ON A.TAut_FK_TUseID = u.TUse_PK_ID  JOIN Troles R on R.TRol_PK_ID = A.TAut_FK_TRolID  JOIN TInstance I on I.TIns_PK_ID = A.TAut_FK_TInsID where I.TIns_Label =@InstLabel", "TUse_PK_ID", "TRol_Label", "@InstLabel", ConfigurationManager.AppSettings["NomInstance"]);

        }

        public static string GetRole(int UserId)
        {
            if (zeRoles == null) { return ""; }
            //TODO :
            //Remettre la vraie condition!!
            //if (!zeRoles.ContainsKey(UserId))
            if (true)
            {
                InitRoles(_connectionString);
            }
            if (!zeRoles.ContainsKey(UserId))
            {
                return "";
            }
            else
            {
                return zeRoles.Where(s => s.Key == UserId).Select(s => s.Value).FirstOrDefault();
            }

        }

        public static bool GetAppStatus(long userId, string app)
        {
            bool result = false;
            //DBCnx myConn = new SqlCnx(_connectionString);
            //DataTable resultTable = myConn.GetDataTableFromCnxWithArgs("if exists(select TIns_Label, TAut_FK_TRolID from TInstance inner join TAutorisations on TIns_PK_ID = TAut_FK_TInsID inner join TUsers on TAut_FK_TUseID = TUse_PK_ID where TUse_PK_ID = @UserId AND TIns_Label like '' + @InstLabel + '' AND TAut_FK_TRolID in (1,2,3,5)) select 1 else select 0", "@InstLabel", app, "@UserId", userId);
            return true;// Convert.ToBoolean(resultTable.Rows[0][0]);
        }
    }
    public class RenecoSecurityAuthHandler : DelegatingHandler
    {



        protected System.Threading.Tasks.Task<HttpResponseMessage> Send403(SecurityReturn infos = null)
        {

            var tsc = new TaskCompletionSource<HttpResponseMessage>();
            HttpResponseMessage Reponse = new HttpResponseMessage(HttpStatusCode.Forbidden);
            // TODO Ajouter l'adresse du portal
            if (infos == null)
            {
                Reponse.Content = new StringContent(JsonConvert.SerializeObject(
                             new Dictionary<string, object> {
                        {"AuthRedirect",""}
                            })
                 );
            }
            else
            {
                Reponse.Content = new StringContent(JsonConvert.SerializeObject(
                             new Dictionary<string, object> {
                                {"UserName", infos.UserName},
                                {"UserId", infos.UserId},                                
                                {"ErrorInfo", infos.errorCode.ToString()}
                            })
                 );
            }

            tsc.SetResult(Reponse);
            return tsc.Task;

        }
        protected override System.Threading.Tasks.Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            //A decommenter pour une version sécurisée
            try
            {
                CookieHeaderValue Cookies = request.Headers.GetCookies().FirstOrDefault();
                if (Cookies[ConfigurationManager.AppSettings["RenecoCookie"]] == null)
                {
                    throw new Exception("Error");
                }
                string token = Cookies[ConfigurationManager.AppSettings["RenecoCookie"]].Value;

                if (token == null)
                {
                    throw new Exception("Error");
                }


                string Key = ConfigurationManager.AppSettings["RenecoCookieKey"];
                Dictionary<string, object> decodedPayload = (Dictionary<string, object>)JsonWebToken.DecodeToObject(token, Key, false);

                long userId = long.Parse(decodedPayload["iss"].ToString());

                RenecoUser MyUser = new RenecoUser { Name = decodedPayload["username"].ToString(), UserID = userId, UserLanguage = decodedPayload["userlanguage"].ToString(), IsEcol = RoleManager.GetAppStatus(userId, "%ecol%"), IsTrack = RoleManager.GetAppStatus(userId, "%track%") };
                //RenecoUser MyUser = new RenecoUser { Name = "Schtroudel", UserID = 454, UserLanguage = "fr" };
                HttpContext.Current.User = new RenecoPrincipal { Identity = MyUser, RoleInPos = MyUser.RoleInPos, UserId = MyUser.UserID };

                string url = request.RequestUri.AbsolutePath;
                string[] urlTab = url.Split('/');
                int apiIdex = Array.FindIndex(urlTab, t => t.IndexOf("api", StringComparison.InvariantCultureIgnoreCase) >= 0);
                string controllerName = urlTab[apiIdex + 1];
                HttpRequestMessage test = request;
                if (controllerName.IndexOf("Security", StringComparison.InvariantCultureIgnoreCase) == -1 && controllerName.IndexOf("Language", StringComparison.InvariantCultureIgnoreCase) == -1)
                {
                    SecurityReturn check = CheckSecurity.checkSecurity(test, MyUser);
                    if (check.errorCode != ErrorCode.Ok)
                    {
                        return Send403(check);
                    }
                }
            }
            catch (Exception ex)
            {
                //LogManager.SendException(LogLevel.Error, LogDomaine.WebApplication, ex);
                return Send403();
            }
            return base.SendAsync(request, cancellationToken);
        }
    }

    public class RenecoPrincipal : IPrincipal
    {

        public IIdentity Identity
        {
            get;
            set;
        }

        public bool IsInRole(string role)
        {
            return true;
        }

        public string RoleInPos
        {
            get;
            set;
        }

        public long UserId
        {
            get;
            set;
        }

        public string language
        {
            get;
            set;
        }
    }
    public class RenecoUser : IIdentity
    {
        public string AuthenticationType
        {
            get { return "Reneco"; }
        }

        public bool IsAuthenticated
        {
            get;
            set;
        }

        public string Name
        {
            get;
            set;
        }
        public long UserID
        {
            get;
            set;
        }

        public string UserLanguage { get; set; }

        public string RoleInPos
        {
            get
            {
                return RoleManager.GetRole((int)this.UserID);
            }
        }

        public bool IsTrack
        {
            get;
            set;
        }

        public bool IsEcol
        {
            get;
            set;
        }
    }
}