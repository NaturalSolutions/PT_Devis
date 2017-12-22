define(['marionette', 'PT_DataAccess', 'i18n'],
	function (Marionette) {
		'use strict';

		return Marionette.LayoutView.extend({
			template: 'app/base/home/tpl/tpl-home.html',
			className: 'home-page ns-full-height animated',
			events: {
				'change #projects': 'loadEpics',
				'change #epics': 'loadStories',
				'click #process': 'process'
			},
			sortedStories: {
				amo: [],
				des: [],
				dev: []
			},
			initialize: function (options) {
				this.allProjects = getAllProjects();
				Backbone.on('returnProcess', this.onReturnProcess, this);
			},

			onShow: function (options) {
				$.each(this.allProjects, function () {
					$('#projects').append($('<option>', {
						value: this.id,
						text: this.name
					}));
				})
			},

			loadEpics: function (e) {
				this.projectId = $(e.currentTarget).find("option:selected").val();
				this.epics = getEpics(this.projectId);
				var selectEpic = $("#epics");
				selectEpic.html('').append($('<option>', {
					value: '',
					text: ''
				}));
				$.each(this.epics, function () {
					selectEpic.append($('<option>', {
						value: this.name,
						text: this.name
					}));
				})
			},

			loadStories: function (e) {
				var _this = this;
				this.stories = getEpicStories(this.projectId, $(e.currentTarget).find("option:selected").val().toLowerCase());
				var storiesContainer = $('#stories');
				var amoCont = storiesContainer.find('#amo');
				amoCont.html('');
				var desCont = storiesContainer.find('#des');
				desCont.html('');
				var devCont = storiesContainer.find('#dev');
				devCont.html('');
				$.each(this.stories, function () {
					var labels = this.labels.map(o => o.name);
					for (var i in labels) {
						if (labels[i] == 'amo') {
							_this.sortedStories.amo.push(this);
							amoCont.append('<li>' + this.name + '</li>');
						} else if (labels[i] == 'des') {
							_this.sortedStories.des.push(this);
							desCont.append('<li>' + this.name + '</li>');
						} else if (labels[i] == 'dev') {
							_this.sortedStories.dev.push(this);
							devCont.append('<li>' + this.name + '</li>');
						}

					}
				})
			},

			process: function () {
				var ressource = calculateTasks(this.sortedStories, this.projectId);

			},

			onReturnProcess: function (res) {
				var _this = this;
				$.ajax({
					type: 'POST',
					url: 'http://localhost/DevisApi/api/Facturation/postFactu',
					dataType: 'json',
					data: res
				}).done(function (data) {
					_this.factuTotal = data;
					_this.drawFactu(data);
					_this.drawRessource(data);
				});
			},

			drawFactu: function (res) {
				res = JSON.parse(res);
				var factuTypeContainer = $('#factu').find('#type');
				var amoCont = factuTypeContainer.find('#amo');
				amoCont.html('');
				var desCont = factuTypeContainer.find('#des');
				desCont.html('');
				var devCont = factuTypeContainer.find('#dev');
				devCont.html('');
				for (var i in res) {
					if (i == "amo") {
						for (var j in res[i]) {
							amoCont.append('<li>' + i + ' ' + res[i][j].initials + ': ' + res[i][j].value + '</li>');
						}
					}
					if (i == "des") {
						for (var j in res[i]) {
							desCont.append('<li>' + i + ' ' + res[i][j].initials + ': ' + res[i][j].value + '</li>');
						}
					}
					if (i == "dev") {
						for (var j in res[i]) {
							devCont.append('<li>' + i + ' ' + res[i][j].initials + ': ' + res[i][j].value + '</li>');
						}
					}
				}
			},

			drawRessource: function (res) {
				res = JSON.parse(res);
				var ressourceContainer = $('#factu').find('#ressource');				
				ressourceContainer.html('').append('<span>Ressource prix totale</span>');			
				var tempResstab = [];
				for(var i in res){
					tempResstab =  tempResstab.concat(res[i]);
				}
				var mergedDatas = [];
				for(var i in tempResstab){
					if(tempResstab[i] != NaN){
						if(!mergedDatas.find(o => o.initials == tempResstab[i].initials)){
							mergedDatas.push({initials : tempResstab[i].initials, value : parseInt(tempResstab[i].value)});
						}else{
							mergedDatas[mergedDatas.findIndex(x => x.initials == tempResstab[i].initials)].value += parseInt(tempResstab[i].value);
						}
					}
				}
				ressourceContainer.append($('<ul>', {
					id: 'ulRessources',
				}));				
				var ul = $('#ulRessources');
				for (var i in mergedDatas) {	
					ul.append('<li>' + mergedDatas[i].initials + ': ' + mergedDatas[i].value + '</li>');
				}
			}
		});
	});
