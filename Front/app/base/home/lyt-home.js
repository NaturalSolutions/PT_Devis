define(['marionette', 'config', 'moment', 'PT_DataAccess', 'i18n'],
	function (Marionette, config, moment) {
		'use strict';

		return Marionette.LayoutView.extend({
			template: 'app/base/home/tpl/tpl-home.html',
			className: 'home-page ns-full-height animated',
			events: {
				'change #projects': 'loadEpics',
				'change #epics': 'loadStories',
				'click #processDevis': 'processDevis',
				'click #processFactu': 'processFactu',
				'click #launchFile': 'createFile'
			},
			sortedStories: {
				amo: [],
				des: [],
				dev: []
			},
			sum: [],
			isFactu: false,
			initialize: function (options) {
				this.allProjects = getAllProjects();
				this.sum = [];
				Backbone.on('returnProcess', this.onReturnProcess, this);
				Backbone.on('returnFactuProcess', this.onReturnFactuProcess, this);

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
				this.epicLabel = $(e.currentTarget).find("option:selected").val().toLowerCase();
				this.stories = getEpicStories(this.projectId, this.epicLabel);
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

			processDevis: function () {
				var ressource = calculateTasks(this.sortedStories, this.projectId);
			},
			// processFactu: function () {

			// },

			onReturnProcess: function (res) {
				var _this = this;
				$('#projects').attr('disabled', true)
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
					if (_this.sum.find(o => o.projet == _this.projectName)) {
						//TODO proposer au choix de conserver ou d'écraser la précédente entrée
						alert('trouvé');
						$('#projects').attr('disabled', false)

					} else {
						alert('onreturnprocess')
						_this.manageProject();
						$('#projects').attr('disabled', false)

					}
				});
			},

			onReturnFactuProcess: function (res) {
				var _this = this;
				$('#projects').attr('disabled', true)

				$.ajax({
					type: 'POST',
					url: 'http://localhost/DevisApi/api/Facturation/postfactuWBonus',
					dataType: 'json',
					data: res
				}).done(function (data) {
					_this.factuTotal = data;
					_this.drawFactu(data);
					_this.drawRessource(data);
					_this.factu = JSON.parse(data);
					if (_this.sum.find(o => o.projet == _this.projectName)) {
						//TODO proposer au choix de conserver ou d'écraser la précédente entrée
						alert('trouvé');
						$('#projects').attr('disabled', false)
					} else {
						_this.manageProject(true);
						$('#projects').attr('disabled', false)
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
				for (var i in res) {
					tempResstab = tempResstab.concat(res[i]);
				}
				var mergedDatas = [];
				for (var i in tempResstab) {
					if (tempResstab[i] != NaN && tempResstab[i] != null) {
						if (!mergedDatas.find(o => o.initials == tempResstab[i].initials)) {
							mergedDatas.push({ initials: tempResstab[i].initials, value: parseInt(tempResstab[i].value) });
						} else {
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

			manageProject: function (isFactu = false) {
				var obj = {};
				obj["projet"] = this.projectName;
				obj["total"] = 0;
				if (isFactu) {
					obj["stories"] = this.stories.stories.map(o => o.name);
					obj["storiesBonus"] = this.stories.bonus.map(o => o.name).length > 0 ? this.stories.bonus.map(o => o.name) : [""];
					obj["total"] = 0;
					obj["totalBonus"] = 0;
					if (this.factu && this.factu.normal) {
						for (var i in this.factu.normal) {
							if (i == "amo") {
								for (var j in this.factu.normal[i]) {
									obj["total"] += this.factu.normal[i][j].sum;
								}
							}
							if (i == "des") {
								for (var j in this.factu.normal[i]) {
									obj["total"] += this.factu.normal[i][j].sum;
								}
							}
							if (i == "dev") {
								for (var j in this.factu.normal[i]) {
									obj["total"] += this.factu.normal[i][j].sum;
								}
							}
						}
					}

					if (this.factu && this.factu.bonus) {
						for (var i in this.factu.bonus) {
							if (i == "amo") {
								for (var j in this.factu.bonus[i]) {
									obj["totalBonus"] += this.factu.bonus[i][j].sum;
								}
							}
							if (i == "des") {
								for (var j in this.factu.bonus[i]) {
									obj["totalBonus"] += this.factu.bonus[i][j].sum;
								}
							}
							if (i == "dev") {
								for (var j in this.factu.bonus[i]) {
									obj["totalBonus"] += this.factu.bonus[i][j].sum;
								}
							}
						}
					}
				} else {
					obj["stories"] = this.stories.map(o => o.name);
					obj["total"] = 0;
					if (this.factu) {
						for (var i in this.factu) {
							if (i == "amo") {
								for (var j in this.factu[i]) {
									obj["total"] += this.factu[i][j].sum;
								}
							}
							if (i == "des") {
								for (var j in this.factu[i]) {
									obj["total"] += this.factu[i][j].sum;
								}
							}
							if (i == "dev") {
								for (var j in this.factu[i]) {
									obj["total"] += this.factu[i][j].sum;
								}
							}
						}
					}
				}
				obj['unfinished'] = getUnfinishedStories(this.projectId, this.epicLabel).map(x => x.name);
				this.sum.push(obj);
			},

			createFile: function () {
				var _this = this;
				var complement = this.isFactu ? 'Factu' : 'Devis';
				if (this.isFactu) {
					var obj = {}
					obj.chefProjet = { jrs: parseInt($('#CDP').val()), we: parseInt($('#CDPW').val()), f: parseInt($('#CDPF').val()) };
					obj.directeur = { jrs: parseInt($('#DT').val()), we: parseInt($('#DTW').val()), f: parseInt($('#DTF').val()) }
					obj.projet = _this.sum
					$.ajax({
						method: 'POST',
						url: 'http://localhost/DevisApi/api/WordFile/create' + complement,
						dataType: 'json',
						//data: {"docInfos":JSON.stringify(_this.sum)}
						data: obj,
					}).done(function (data) {
						data = JSON.parse(data);
						$("#linkContainer").append('<a href="file:///' + config.serverPath + data + '">Le fichier</a>');
						let blob = new Blob(data.encoded, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
						var link = document.createElement('a');
						link.href = window.URL.createObjectURL(blob);
						link.download = data.fileName;
						link.click();
					})
				} else {
					$.ajax({
						method: 'POST',
						url: 'http://localhost/DevisApi/api/WordFile/create' + complement,
						dataType: 'json',
						//data: {"docInfos":JSON.stringify(_this.sum)}
						data: { "": _this.sum },
					}).done(function (data) {
						data = JSON.parse(data);
						$("#linkContainer").append('<a href="file:///' + config.serverPath + data + '">Le fichier</a>');
						let blob = new Blob(data.encoded, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
						var link = document.createElement('a');
						link.href = window.URL.createObjectURL(blob);
						link.download = data.fileName;
						link.click();
					})

				}
			},

			processFactu: function () {
				var firstDay, lastDay;
				if ($('#month').val()) {
					firstDay = moment($('#month').val());
					lastDay = moment();

				}
				this.isFactu = true;
				var tempSortedStories = getAcceptedStoriesAtDate(this.projectId, firstDay, lastDay, this.epicLabel);
				// this.sortedStories.amo = tempSortedStories.amo;
				// this.sortedStories.des = tempSortedStories.des;
				// this.sortedStories.dev = tempSortedStories.dev;
				this.stories.stories = [];
				this.stories.bonus = [];
				for (var i in tempSortedStories.stories) {
					this.stories.stories = this.stories.stories.concat(tempSortedStories.stories[i]);
					this.stories.bonus = this.stories.bonus.concat(tempSortedStories.bonus[i]);
				}
				//this.stories.stories = tempSortedStories.stories;
				//this.projectId = this.projectId;
				var res = calculateTasks(tempSortedStories.stories, this.projectId, true);
				var resbonus = calculateTasks(tempSortedStories.bonus, this.projectId, true);

				this.onReturnFactuProcess({ normal: res, bonus: resbonus })

			}
		});
	});
