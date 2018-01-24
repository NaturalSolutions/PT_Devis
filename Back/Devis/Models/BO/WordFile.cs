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
            manageDevisTable();

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

        private void manageDevisTable()
        {
            Table tab = this.final.Tables[0];
            //Row templateToCopy = tab.Rows[1];
            //TODO faire la vraie
            List<object> listToCreate = new List<object>() { new object(), new object(), new object(), new object()};
            for(int i = 1; i < listToCreate.Count; i++)
            {
                Row toAdd = tab.InsertRow();
                //project
                toAdd.Cells[0].InsertParagraph("ecoReleve");
                //stories
                toAdd.Cells[1].InsertParagraph("-Story 1 \\r\\n -Story2");
                //Cout
                toAdd.Cells[2].InsertParagraph("3 millions de dollars");


            }
        }
    }
}