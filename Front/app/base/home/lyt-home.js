define(['marionette','PT_DataAccess','i18n'],
function(Marionette) {
	'use strict';

	return Marionette.LayoutView.extend({
		template: 'app/base/home/tpl/tpl-home.html',
		className: 'home-page ns-full-height animated',
		events: {
			'change #projects':'loadEpics',
			'change #epics':'loadStories',
			'click #process': 'process'
		},
		sortedStories : {
			amo: [],
			des: [],
			dev: []
		},
		initialize: function(options){
			this.allProjects = getAllProjects();			
		},

		onShow : function(options) {
			//id projet devis
			var epics = getEpics(2136665);
			console.log('epics', epics);
			//id premier bon de commande
			var epicTasks = getEpicStories(2136665, "commande 1");
			console.log("tasks", epicTasks)

			$.each(this.allProjects, function(){
				$('#projects').append($('<option>', {
					value: this.id,
					text: this.name
				}));
			})
		},

		loadEpics: function(e){
			this.projectId = $(e.currentTarget).find("option:selected").val();
			this.epics = getEpics(this.projectId);
			var selectEpic = $("#epics");
			selectEpic.html('').append($('<option>', {
				value: '',
				text: ''
			}));
			$.each(this.epics, function(){
				selectEpic.append($('<option>', {
					value: this.name,
					text: this.name
				}));
			})
		},

		loadStories: function(e){
			var _this = this;
			this.stories = getEpicStories(this.projectId, $(e.currentTarget).find("option:selected").val().toLowerCase());
			var storiesContainer = $('#stories');
			var amoCont = storiesContainer.find('#amo');
			var desCont = storiesContainer.find('#des');
			var devCont = storiesContainer.find('#dev');
			$.each(this.stories, function(){
				var labels = this.labels.map(o => o.name);
				for(var i in labels){
					if(labels[i] == 'amo'){
						_this.sortedStories.amo.push(this);
						amoCont.append('<li>' + this.name + '</li>');
					}else if(labels[i] == 'des'){
						_this.sortedStories.des.push(this);						
						desCont.append('<li>' + this.name + '</li>');
					}else if(labels[i] == 'dev'){
						_this.sortedStories.dev.push(this);						
						devCont.append('<li>' + this.name + '</li>');
					}

				}
			})
		},

		process: function(){
			//getTasks('amo', this.sortedStories);
			calculateTasks(this.sortedStories, this.projectId)
		}
	});
});
