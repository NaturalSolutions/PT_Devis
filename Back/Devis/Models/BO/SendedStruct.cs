using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Devis.Models.BO
{
    public struct sended
    {
        public string projet;
        public List<string> stories;
        public List<string> storiesBonus;
        public int total;
        public int? totalBonus;
    }
}