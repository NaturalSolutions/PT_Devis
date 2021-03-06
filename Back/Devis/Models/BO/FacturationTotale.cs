﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.Entity;

namespace Devis.Models.BO
{
    public class FacturationTotale
    {
        public List<Facturation> amo { get; set; }
        public List<Facturation> dev { get; set; }
        public List<Facturation> des { get; set; }

        public FacturationTotale()
        {

        }

        public void updateValue()
        {
            if(amo != null)
            {
                amo.ForEach(x => x.updateValue(true));
            }
            if (dev != null)
            {
                dev.ForEach(x => x.updateValue(false));
            }
            if (des != null)
            {
                des.ForEach(x => x.updateValue(false));
            }
        }

    }
}