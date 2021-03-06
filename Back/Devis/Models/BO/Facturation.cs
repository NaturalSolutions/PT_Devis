﻿using System;
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
                        this.initials = res.Initial;
                        decimal dailyValue = this.value != null ? Math.Round(Convert.ToDecimal(this.value / 7),2) : 0;
                        this.value = Math.Round(dailyValue * (res.Niveau == 3 ? (decimal)tar.Tar3 : (decimal)tar.Tar5),2);
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
                    decimal dailyValue = this.value != null ? Math.Round(Convert.ToDecimal(this.value / 7),2) : 0;
                    dailyValue = getDecimalPart(dailyValue);

                    this.value = Math.Round(dailyValue * (res.Niveau == 3 ? (decimal)tar.Tar3 : (decimal)tar.Tar5), 2);
                }
            }
        }

        private decimal getDecimalPart(decimal value)
        {
            string strValue = value.ToString();
            string[] tabValues;
            if(strValue.IndexOf('.') != -1)
            {
                tabValues = strValue.Split('.');
            }
            else if(strValue.IndexOf(',') != -1)
            {
                tabValues = strValue.Split(',');
            }
            else
            {
                return value;
            }
            if(tabValues.Length > 1)
            {
                tabValues[1] = setHalfDays(Convert.ToInt32(tabValues[1]));
                if(tabValues[1] != "1")
                {
                    return Convert.ToDecimal(String.Join(",", tabValues));
                }
                else
                {
                    return Convert.ToDecimal(tabValues[0]) + 1;
                }
            }
            else
            {
                return Convert.ToDecimal(tabValues[0]);
            }

        }

        private string setHalfDays(int value)
        {
            if(value.ToString().Length < 2)
            {
                if(value == 0)
                {
                    return "00";
                }
                else if (value <= 5)
                {
                    return "50";
                }
                else
                {
                    return "1";
                }
            }
            else
            {
                if (value == 0)
                {
                    return "00";
                }
                else if (value <= 50)
                {
                    return "50";
                }
                else
                {
                    return "1";
                }
            }
        }
    }
}