using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace Devis.Models.BO
{
    public class ChefDeProjet
    {
        [DataMember]
        public decimal? jrs { get; set; }
        [DataMember]
        public decimal? we { get; set; }
        [DataMember]
        public decimal? f { get; set; }
        public decimal sum { get; set; }

        public void updateValue()
        {
            using (DevisEntities cont = new DevisEntities())
            {                
                Tarification tar = cont.Tarification.Where(x => x.Type == "Chef de projet fonctionnel").FirstOrDefault();
                decimal dailyValue = Convert.ToDecimal((this.jrs != null ? this.jrs : 0) * tar.Tar5);
                decimal dailyValueWE = Convert.ToDecimal((this.we != null ? this.we : 0) * tar.Tar5 * 1.5m);
                decimal dailyValueF = Convert.ToDecimal((this.f != null ? this.f : 0) * tar.Tar5 * 2m);
                
                this.sum = Convert.ToDecimal(dailyValue + dailyValueWE + dailyValueF);
            }
        }
    }

    public class DirecteurTechnique
    {
        [DataMember]
        public decimal? jrs { get; set; }
        [DataMember]
        public decimal? we { get; set; }
        [DataMember]
        public decimal? f { get; set; }
        public decimal sum { get; set; }

        public void updateValue()
        {
            using (DevisEntities cont = new DevisEntities())
            {
                Tarification tar = cont.Tarification.Where(x => x.Type == "Directeur technique").FirstOrDefault();
                decimal dailyValue = Convert.ToDecimal((this.jrs != null ? this.jrs : 0) * tar.Tar5);
                decimal dailyValueWE = Convert.ToDecimal((this.we != null ? this.we : 0) * tar.Tar5 * 1.5m);
                decimal dailyValueF = Convert.ToDecimal((this.f != null ? this.f : 0) * tar.Tar5 * 2m);

                this.sum = Convert.ToDecimal(dailyValue + dailyValueWE + dailyValueF);
            }
        }
    }

    public class FactuInfomations
    {
        [DataMember]
        public List<sended> projet { get; set; }
        [DataMember]
        public DirecteurTechnique directeur { get; set; }
        [DataMember]
        public ChefDeProjet chefProjet { get; set; }
       
    }
}