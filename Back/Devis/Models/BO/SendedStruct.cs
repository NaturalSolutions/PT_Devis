using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace Devis.Models.BO
{
    public class sended
    {
        [DataMember]
        public string projet { get; set; }
        [DataMember]
        public List<string> stories { get; set; }
        [DataMember]
        public List<string> storiesBonus { get; set; }
        [DataMember]
        public int total { get; set; }
        [DataMember]
        public int totalBonus { get; set; }        
    }
}