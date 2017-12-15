using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Data.Entity;
using Position_DAL;


namespace Position_WebAPI
{
    [Flags]
    public enum ErrorCode
    {
        Ok = 0,
        DomainException = 1,
        ControllerException = 2,
        RightException = 4
    }

    public class SecurityReturn
    {
        public string UserName;
        public long UserId;
        public ErrorCode errorCode;

        public SecurityReturn(string inUserName, long inUserId, ErrorCode inErrorCode)
        {
            UserName = inUserName;
            UserId = inUserId;
            errorCode = inErrorCode;
        }

        public SecurityReturn() { }
    }

    public static class CheckSecurity
    {
        public static SecurityReturn checkSecurity(HttpRequestMessage req, RenecoUser user)
        {


            SecurityReturn result = new SecurityReturn(user.Name, user.UserID, true);

            return result;
        }
    }
}
