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

        [ActionName("create")]
        public void GetCreate(object docInfos)
        {
            WordFile test = new WordFile();
        }
    }
}
