using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.Entity;

namespace Devis.Models.BO
{
    public class FacturationWBonus
    {
        public FacturationTotale normal { get; set; }
        public FacturationTotale bonus { get; set; }
        
        public FacturationWBonus()
        {

        }

        public void updateValue()
        {
            if(normal != null)
            {
                if(normal.amo != null)
                {
                    normal.amo.ForEach(x => x.updateValue(true));
                }
                if (normal.dev != null)
                {
                    normal.dev.ForEach(x => x.updateValue(false));
                }
                if (normal.des != null)
                {
                    normal.des.ForEach(x => x.updateValue(false));
                }
            }
            if(bonus != null)
            {
                if (bonus.amo != null)
                {
                    bonus.amo.ForEach(x => x.updateValue(true));
                }
                if (bonus.dev != null)
                {
                    bonus.dev.ForEach(x => x.updateValue(false));
                }
                if (bonus.des != null)
                {
                    bonus.des.ForEach(x => x.updateValue(false));
                }
            }
        }

    }
}