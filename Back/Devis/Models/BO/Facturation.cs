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
        //public string name { get; set; }
        public string initials { get; set; }
        //public string typeName { get; set; }
        public decimal? value { get; set; }

        public Facturation()
        {

        }

        public Facturation(string initials, bool isAmo, long type)
        {
            using(DevisEntities cont = new DevisEntities())
            {
                Ressource res = cont.Ressource.Where(x => x.Initial == initials).FirstOrDefault();
                if(res != null)
                {
                    List<long> typeId = res.Tarification_Ressource.Select(x => x.FK_Tarification).ToList();
                    Tarification tar = cont.Tarification.Where(x => typeId.Contains(x.ID) && x.IsAmo == isAmo).FirstOrDefault();
                    if(tar != null)
                    {
                        //this.name = res.Name;
                        this.initials = res.Initial;
                        this.value = this.value * (res.Niveau == 3 ? tar.Tar3 : tar.Tar5);
                    }
                }
            }
        }

        public void updateValue(bool isAmo)
        {
            using (DevisEntities cont = new DevisEntities())
            {
                Ressource res = cont.Ressource.Where(x => x.Initial == initials).Include(x => x.Tarification_Ressource).FirstOrDefault();
                if (res != null)
                {
                    List<long> typeId = res.Tarification_Ressource.Select(x => x.FK_Tarification).ToList();
                    Tarification tar = cont.Tarification.Where(x => typeId.Contains(x.ID) && x.IsAmo == isAmo).FirstOrDefault();
                    this.value = this.value * (res.Niveau == 3 ? tar.Tar3 : tar.Tar5);
                }
            }
        }
    }
}