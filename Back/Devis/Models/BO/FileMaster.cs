using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace Devis.Models.BO
{
    public class FileMaster
    {
        [DataMember]
        public bool isFactu { get; set; }
        [DataMember]
        public List<sended> fileInfos { get; set; }        
    }
}