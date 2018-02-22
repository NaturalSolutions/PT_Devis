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
    public class FacturationController : ApiController
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

        [ActionName("factu")]
        public string GetFactu(FacturationTotale laFactu)
        {
            laFactu.updateValue();
            return JsonConvert.SerializeObject(laFactu);
        }

        [ActionName("postfactu")]
        public string PostFactu(FacturationTotale laFactu)
        {
            laFactu.updateValue();
            return JsonConvert.SerializeObject(laFactu);
        }

        [ActionName("postfactuWBonus")]
        public string PostFactuWBOnus(FacturationWBonus lesFactus)
        {
            //FacturationWBonus result = new FacturationWBonus();
            lesFactus.updateValue();
            return JsonConvert.SerializeObject(lesFactus);
        }
    }
}
