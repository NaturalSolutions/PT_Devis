using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.Entity;
using System.Diagnostics;
using Xceed.Words.NET;
using System.Reflection;
using Newtonsoft.Json.Linq;

namespace Devis.Models.BO
{
    public class WordFile
    {

        DocX final { get; set; }
        decimal tableSubTotal { get; set; }
        decimal tableSubTotalBonus { get; set; }
        string basePath { get; set; }
        public string fileName { get; set; }
        public bool isFactu { get; set; }
        //Dictionary<string, object> elements { get; set; } = new Dictionary<string, object>()
        //{
        //    { "dateCreation", DateTime.Now },
        //    { "dateVersion", DateTime.Now },
        //    { "numVersion", 1.0 },
        //    { "numEdition" , 1 },
        //    { "nomFichier" , "" },
        //    { "totalTable" , 0 },
        //    { "facturationDT" , 7 },
        //    { "facturationCDP" , 20 },
        //    { "estimationDTCDP" , 0 },
        //    { "totalCumule" , 0 },
        //    { "dateDebut", new DateTime( DateTime.Now.Year, DateTime.Now.Month, 1)},
        //    { "livraisonFinal", new DateTime( DateTime.Now.Year, DateTime.Now.Month, 1).AddMonths(1).AddDays(-1)}
        //};

        public WordFile(List<sended> obj, bool isFactu = false)
       {
            DateTime longDate = DateTime.Now;
            this.isFactu = isFactu;
            this.basePath = System.AppDomain.CurrentDomain.BaseDirectory;
            this.tableSubTotal = 0;
            if (isFactu)
            {
                this.fileName = "Facturation_All_NS_Reneco_" + longDate.Year.ToString() + "_" + longDate.AddMonths(1).Month + ".docx";
            }
            else
            {
                this.fileName = "Devis_All_NS_Reneco_" + longDate.Year.ToString() + "_" + longDate.AddMonths(1).Month+ ".docx";
            }
            this.final = loadTemplate();
            setValue("dateCreation", longDate.ToShortDateString());
            manageDevisTable(obj);
            insertElementsInFiles();
            //Save template to a new name same location
            //TODO : convenir d'une convention de nommage 
            this.final.SaveAs(this.basePath + @"\Content\" + this.fileName);
       }

        private DocX loadTemplate()
        {
            string fileName;
            if (this.isFactu)
            {
                fileName = this.basePath + @"\Content\templateFacturePropre.docx";
            }
            else
            {
                fileName= this.basePath + @"\Content\templateDevisPropre.docx";
            }
            DocX temp = DocX.Load(fileName);
            //LoadFile in memory
            return temp;
        }

        private void setValue(string balise, string toSet)
        {
            this.final.ReplaceText("[" + balise + "]", toSet);
        }

        private void insertElementsInFiles()
        {
            DevisElements infos = new DevisElements(this.fileName, this.tableSubTotal);
            JObject json = JObject.FromObject(infos);
            foreach (JProperty property in json.Properties())
            {
                setValue(property.Name, property.Value.ToString());
            }
        }

        private void manageDevisTable(List<sended> obj)
        {
            Table tab = this.final.Tables[2];
            //Row templateToCopy = tab.Rows[1];
            foreach(sended insert in obj)
            {
                Row toAdd = tab.InsertRow(tab.RowCount - 2);
                //project
                toAdd.Cells[0].InsertParagraph(insert.projet);
                List bulletedList = null;                               
                //stories
                foreach (string story in insert.stories)
                {
                    if (bulletedList == null)
                    {
                        bulletedList = this.final.AddList(story, 0, ListItemType.Bulleted, 1);
                    }
                    else
                    {
                        this.final.AddListItem(bulletedList, story);
                    }
                }
                toAdd.Cells[1].InsertList(bulletedList);
                //Cout
                toAdd.Cells[2].InsertParagraph(insert.total.ToString() + "€");
                this.tableSubTotal += insert.total;
            }

            tab.Rows[tab.RowCount - 1].Cells[1].ReplaceText("[totalTable]", this.tableSubTotal.ToString());

            if (this.isFactu)
            {
                Table tabBonus = this.final.Tables[2];
                //Row templateToCopy = tab.Rows[1];
                foreach (sended insert in obj)
                {
                    Row toAdd = tabBonus.InsertRow(tabBonus.RowCount - 2);
                    //project
                    toAdd.Cells[0].InsertParagraph(insert.projet);
                    List bulletedList = null;
                    //stories
                    foreach (string story in insert.stories)
                    {
                        if (bulletedList == null)
                        {
                            bulletedList = this.final.AddList(story, 0, ListItemType.Bulleted, 1);
                        }
                        else
                        {
                            this.final.AddListItem(bulletedList, story);
                        }
                    }
                    toAdd.Cells[1].InsertList(bulletedList);
                    //Cout
                    toAdd.Cells[2].InsertParagraph(insert.total.ToString() + "€");
                    this.tableSubTotalBonus += insert.total;
                }

                tabBonus.Rows[tabBonus.RowCount - 1].Cells[1].ReplaceText("[totalTableBonus]", this.tableSubTotalBonus.ToString());
            }
        }
    }
}