define(['marionette', 'config', 'PT_DataAccess', 'i18n'],
	function (Marionette, config) {
		'use strict';

		return Marionette.LayoutView.extend({
			template: 'app/base/home/tpl/tpl-home.html',
			className: 'home-page ns-full-height animated',
			events: {
				'change #projects': 'loadEpics',
				'change #epics': 'loadStories',
				'click #process': 'process',
				'click #launchFile': 'createFile'
			},
			sortedStories: {
				amo: [],
				des: [],
				dev: []
			},
			sum:[],
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
				this.projectName = $(e.currentTarget).find("option:selected").text();
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
				this.stories = null;
				this.stories = getEpicStories(this.projectId, $(e.currentTarget).find("option:selected").val().toLowerCase());
				var storiesContainer = $('#stories');
				var amoCont = storiesContainer.find('#amo');
				amoCont.html('');
				var desCont = storiesContainer.find('#des');
				desCont.html('');
				var devCont = storiesContainer.find('#dev');
				devCont.html('');
				this.sortedStories = {
					amo: [],
					des: [],
					dev: []
				};
				$.each(this.stories, function () {
					console.log('this', this)
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
					_this.factu = JSON.parse(data);
					console.log('_this.sum.find(o => o.projet == _this.projectName)',this.sum)
					if(_this.sum.find(o => o.projet == _this.projectName)){
						alert('trouvé');

					}else{
						_this.manageProject();
					}
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
				console.log('tempResstab', tempResstab);
				for(var i in tempResstab){
					if(tempResstab[i] != NaN && tempResstab[i] != null){
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
			},

			manageProject: function(infos){
				var obj = {};
				obj["projet"] = this.projectName;
				obj["stories"] = this.stories.map(o => o.name);
				obj["total"] = 0;
				for (var i in this.factu) {
					if (i == "amo") {
						for (var j in this.factu[i]) {
							obj["total"] += this.factu[i][j].value;
						}
					}
					if (i == "des") {
						for (var j in this.factu[i]) {
							obj["total"] += this.factu[i][j].value;
						}
					}
					if (i == "dev") {
						for (var j in this.factu[i]) {
							obj["total"] += this.factu[i][j].value;
						}
					}
				}
				this.sum.push(obj);
				console.log('this.sum', this.sum)
			},

			createFile: function(){
				var _this = this;
				console.log('azedfvpkoljaôezdfjvôiaejfià$vjna$àerfb',_this.sum)
				$.ajax({
					contentType: 'application/json; charset=utf-8',
					type: 'POST',
					url: 'http://localhost/DevisApi/api/WordFile/create',
					dataType: 'json',
					data: JSON.stringify(_this.sum)
				}).done(function (data) {
					$("#linkContainer").append('<a href="file:///' + config.serverPath + data + '">Le fichier</a>')
				})
			}
		});
	});
