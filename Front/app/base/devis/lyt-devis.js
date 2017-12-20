define(['marionette','PT_DataAccess','i18n'],
function(Marionette) {
	'use strict';

	return Marionette.LayoutView.extend({
		template: 'app/base/home/tpl/tpl-devis.html',
		
		className: 'home-page ns-full-height animated',
		
		events: {
		},
		
		onShow : function(options) {
			var allProjects = getAllProjects();
			console.log(allProjects);
			var temp = allProjects.find(o => o.Name == 'Devis').map(o => o.ID);
			console.log('temp', temp)
			var epics = getEpics(temp);
			console.log('epics', epics);
		}
	});
});
