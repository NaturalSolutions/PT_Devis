﻿using System;
using System.Collections.Generic;
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

        public DevisElements(string _nomFichier, decimal _totalTable)
        {
            this.dateCreation = DateTime.Now.ToShortDateString();
            this.dateVersion = DateTime.Now.ToShortDateString();
            this.numVersion = 1.0m;
            this.numEdition = 1;
            this.nomFichier = _nomFichier;
            this.totalTable = _totalTable;
            DateTime firstOfTheMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
            this.dateDebut = firstOfTheMonth.ToLongDateString();
            this.livraisonFinal = firstOfTheMonth.AddMonths(1).AddDays(-1).ToLongDateString();

            //Calculs des factu CDP et DT
            using(DevisEntities cont = new DevisEntities())
            {
                //Atttention ta base est pourrie pense a changer les labels pour les finaux
                decimal cdp = cont.Tarification.Where(s => s.Type == "CDP").Select(s => s.Tar5).First();
                decimal dt = cont.Tarification.Where(s => s.Type == "Directeur").Select(s => s.Tar5).First();
                this.facturationCDP = 20 * cdp;
                this.facturationDT = 7 * dt;
                this.estimationDTCDP = this.facturationDT + this.facturationCDP;
            }
            this.totalCumule = this.estimationDTCDP + this.totalTable;
        }
    }
}