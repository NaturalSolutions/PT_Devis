using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.Entity;
using System.Diagnostics;
using Xceed.Words.NET;

namespace Devis.Models.BO
{
    public class WordFile
    {
        DocX final { get; set; }

       public WordFile()
       {
            this.final = loadTemplate();
            DateTime longDate = DateTime.Now;            
            setDate("dateCreation", longDate);
            //Save template to a new name same location
            //TODO : convenir d'une convention de nommage 
            this.final.SaveAs(@"C:\inetpub\wwwroot\devis\Back\Devis\Content\Devis_" + longDate.ToString().Trim().Replace('/','-').Replace(':','_').Replace(@"\s+", "") + ".docx");
       }

        private DocX loadTemplate()
        {
            string fileName = @"C:\inetpub\wwwroot\devis\Back\Devis\Content\templateDevis.docx";
            DocX temp = DocX.Load(fileName);
            //LoadFile in memory
            return temp;
        }

        private void setDate(string balise, DateTime toSet)
        {
            this.final.ReplaceText("[" + balise + "]", toSet.ToShortDateString());
        }
    }
}