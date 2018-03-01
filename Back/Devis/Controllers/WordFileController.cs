using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Devis.Models.BO;
using Newtonsoft.Json;

namespace Devis.Controllers
{
      public class WordFileController : ApiController
    {
        public object Get()
        {
            return new { truc = "truc"};
        }

        //[ActionName("factu")]
        //public string GetFactu([FromUri]string initials, [FromUri]int type)
        //{          
        //    return JsonConvert.SerializeObject(new Facturation(initials, type), Formatting.Indented);
        //}

        //[ActionName("get")]
        //public byte[] GetFactu(Guid id)
        //{           
        //    return new byte[0];
        //}

        [ActionName("createDevis")]
        public string PostCreateDevis(List<sended> docInfos)
        {
            WordFile test = new WordFile(docInfos);
            return JsonConvert.SerializeObject(test);
        }

        [ActionName("createFactu")]
        public string PostCreateFactu(FactuInfomations docInfos)
        {
            //FactuInfomations schtroudel = JsonConvert.DeserializeObject<FactuInfomations>(docInfos);
            WordFile test = new WordFile(docInfos, true);
            return JsonConvert.SerializeObject(test);
        }

        //[ActionName("createFactu")]
        //public string PostCreateFactu(string docInfos)
        //{
        //    List<string> temp = JsonConvert.DeserializeObject<List<string>>(docInfos);
        //    List<sended> infos = new List<sended>();
        //    foreach (string s in temp)
        //    {
        //        infos.Add(JsonConvert.DeserializeObject<sended>(s));
        //    }
        //    //List<sended> test = Newtonsoft.Json.JsonConvert.DeserializeObject<sended>(docInfos);
        //    WordFile test = new WordFile(infos, true);
        //    return test.fileName;
        //}
    }
}
