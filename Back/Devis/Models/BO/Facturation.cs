using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.Entity;

namespace Devis.Models.BO
{
    public class Facturation
    {
        public string name { get; set; }
        public string initials { get; set; }
        public string typeName { get; set; }
        public decimal? value { get; set; }

        public Facturation()
        {

        }

        public Facturation(string initials, int type)
        {
            using(DevisEntities cont = new DevisEntities())
            {
                Ressource res = cont.Ressource.Where(x => x.Initial == initials).FirstOrDefault();
                if(res != null)
                {
                    Tarification tar = cont.Tarification.Where(x => x.ID == type).FirstOrDefault();
                    if(tar != null)
                    {
                        this.name = res.Name;
                        this.initials = res.Initial;
                        this.typeName = tar.Type;
                        this.value = res.Niveau == 3 ? tar.Tar3 : tar.Tar5;
                    }
                }
            }
        }

    }
}