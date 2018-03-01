using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;

namespace Devis.Models.BO
{
    public class DevisElements
    {
        public string dateCreation;
        public string dateVersion;
        public decimal numVersion;
        public int numEdition;
        public string nomFichier;
        public decimal totalTable;
        public decimal facturationDT;
        public decimal facturationCDP;
        public decimal estimationDTCDP;
        public decimal totalCumule;
        public string dateDebut;
        public string livraisonFinal;
        public string mois;
        public string annee;
        public decimal support;

        public DevisElements(string _nomFichier, decimal _totalTable, bool isFactu = false, decimal? _tarCDP = null , decimal? _tarDT = null)
        {
            this.dateCreation = DateTime.Now.ToShortDateString();
            this.dateVersion = DateTime.Now.ToShortDateString();
            this.annee = DateTime.Now.Year.ToString();
            this.mois = new CultureInfo("fr-FR").DateTimeFormat.GetMonthName(isFactu ? DateTime.Now.AddMonths(-1).Month : DateTime.Now.Month).ToString();
            this.numVersion = 1.0m;
            this.numEdition = 1;
            this.nomFichier = _nomFichier;
            this.totalTable = _totalTable;
            this.support = 8900m;
            DateTime firstOfTheMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
            this.dateDebut = firstOfTheMonth.AddMonths(1).ToLongDateString();
            this.livraisonFinal = firstOfTheMonth.AddMonths(2).AddDays(-1).ToLongDateString();

            //Calculs des factu CDP et DT
            using(DevisEntities cont = new DevisEntities())
            {
                if (_tarCDP == null)
                {
                    //Atttention ta base est pourrie pense a changer les labels pour les finaux
                    decimal cdp = cont.Tarification.Where(s => s.Type == "CDP").Select(s => s.Tar5).First();
                    decimal dt = cont.Tarification.Where(s => s.Type == "Directeur").Select(s => s.Tar5).First();
                    //TODO possibiliter de saisir le nombre de jour
                    this.facturationCDP = 20 * cdp;
                    this.facturationDT = 7 * dt;
                }
                else
                {
                    this.facturationCDP = Convert.ToDecimal(_tarCDP);
                    this.facturationDT = Convert.ToDecimal(_tarDT);
                }
                this.estimationDTCDP = this.facturationDT + this.facturationCDP;
            }
            this.totalCumule = this.estimationDTCDP + this.totalTable + this.support;
        }
    }
}