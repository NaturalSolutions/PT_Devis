using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace Devis
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services

            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "FacturationApi",
               routeTemplate: "api/Facturation/{action}",
               defaults: new { controller = "Facturation" }
            );

            config.Routes.MapHttpRoute(
                name: "WordFileApi",
               routeTemplate: "api/WordFile/{action}",
               defaults: new { controller = "WordFile" }
            );

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
        }
    }
}
