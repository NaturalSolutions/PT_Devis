/**

	TODO:
	- set login as marionette.application

**/
define(['jquery', 'marionette', 'backbone', 'config', './base/header/lyt-header'],
	function($, Marionette, Backbone, config, LytHeader){

	'use strict';
	return Marionette.AppRouter.extend({
		appRoutes: {
			'*route(/:page)': 'home',
		},


		insertHeader: function(){
			if(!this.options.controller.rgHeader.hasView()){
				this.options.controller.rgHeader.show( new LytHeader());
			}
		},
	});
});
