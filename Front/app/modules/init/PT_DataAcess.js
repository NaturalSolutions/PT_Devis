///Récupère l'ensemble des projets de NS via le token de FB.
///Param : none
///Return : [objects] repésentant les projets de NS
function getAllProjects() {
	var myProjects;
	$.ajax({
		url: "https://www.pivotaltracker.com/services/v5/projects",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-TrackerToken', 'b4a752782f711a7c564221c2b0c2d5dc');
		},
		async: false,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		processData: false,
		success: function (data) {
			console.log('desdatas', data);
			data.sort(function (a, b) {
				if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
				if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
				return 0;
			});
			var toAdd = [];
			for (var i in data) {
				if (data[i].description == 'reneco') {
					toAdd.push(data[i]);
				}
			}
			myProjects = toAdd;
		},
		error: function () {
			alert("Cannot get data");
		}
	});
	return myProjects;
}

///Récupère l'ensemble des epics d'un projet.
///Param : projectId -> id du projet dans PT
///Return : [objects] repésentant les epics du projets
function getEpics(projectId) {
	var epics;
	$.ajax({
		url: "https://www.pivotaltracker.com/services/v5/projects/" + projectId + "/epics",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-TrackerToken', 'b4a752782f711a7c564221c2b0c2d5dc');
		},
		async: false,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		processData: false,
		success: function (data) {
			epics = data;
		},
		error: function () {
			alert("Cannot get data");
		}
	});
	return epics;
}

///Récupère l'ensemble des membres d'un projet.
///Param : projectId -> id du projet dans PT
///Return : [objects] repésentant les personnes impliquées dans le projet
function getEpicStories(projectId, epicLabel) {
	var stories;
	$.ajax({
		url: "https://www.pivotaltracker.com/services/v5/projects/" + projectId + "/stories?with_label=" + epicLabel.toLowerCase(),
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-TrackerToken', 'b4a752782f711a7c564221c2b0c2d5dc');
		},
		async: false,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		processData: false,
		success: function (data) {
			stories = data;
		},
		error: function () {
			alert("Cannot get data");
		}
	});
	return stories;
}

function sortFinishedStories(stories){
	var finishedTab = [];
	var unfinishedTab = [];
	for(var i in stories){
		if(stories[i].current_state == "accepted"){
			finishedTab.push(stories[i]);
		}else{
			unfinishedTab.push(stories[i]);
		}
	}
	return {finished: finishedTab, unfinished: unfinishedTab};
}

function setError(url, tasksId){
	$('#errorLink').append('<a href="'+url+'">'+tasksId+'</a>')
}

function parseAndFillTasks(tasks, storyId, projectId,isFactu){
	var ressource = [];
	var _this= this;
	$.each(tasks, function () {
		var tabDescrInfo = this.description.split('.-');
		if (tabDescrInfo.length <= 1) {
			tabDescrInfo = this.description.split('. -');
		}
		var isWE = false;
		if(isFactu){
			var regexWE = /[wW]$/
			if(this.description.trim().match(regexWE)){
				isWE = true;
				this.description = this.description.trim().replace(regexWE, "");
			}
		}
		//Si la story ne peut pas etre découpée alors elle n'est pas estimée et ou attribuée
		if (tabDescrInfo.length > 1) {
			//cherche "+" dans le text
			var regex = /\+/
			//Si n programming
			if(this.description.trim().match(regex)){
				//cheche les initals dans le text
				//regex = /[A-Z]+(\+[A-Z]+)+/
				regex = /[A-Z]{2,}(\+[A-Z]{2,})+$/
				if (this.description.trim().match(regex)){
					var ownerBrut = regex.exec(this.description.trim());
					var owners = ownerBrut[0].split("+");
					this.description = this.description.trim().replace(regex, "");
					console.log('descro1', this.description)
					//Cherche les durees dans le text
					regex = /\d+(\+\d+)+/;
						if (this.description.trim().match(regex)) {
							var tabDureeBrut = regex.exec(this.description.trim());
							this.description = this.description.trim().replace(regex, "");
							var tabDuree = tabDureeBrut[0].split('+');
							console.log('la duree PP', tabDuree)
							if (tabDuree.length != owners.length) {
								alert('Probleme d\'estimation et initiales dans la tâche : ' + this.id + ' de la storie n° : ' + storyId + ' n\'est pas estimée.\r\n https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId +'/tasks/' + this.id)
								_this.setError('https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId +'/tasks/' + this.id, this.id)
							} else {
								for (var i in owners) {
									if(!isWE){
										if (!ressource.find(x => x.initials == owners[i])) {
											ressource.push({ initials: owners[i], value: parseInt(tabDuree[i]) });
										} else {
											var index = ressource.findIndex(x => x.initials == owners[i]);
											if(ressource[index].value){
												ressource[index].value += parseInt(tabDuree[i]);
											}else{
												ressource[index].value = parseInt(tabDuree[i]);
											}
										}
									}else{
										if (!ressource.find(x => x.initials == owners[i])) {
											ressource.push({ initials: owners[i], valueWE: parseInt(tabDuree[i]) });
										} else {
											var index = ressource.findIndex(x => x.initials == owners[i]);
											if(ressource[index].valueWE){
												ressource[index].valueWE += parseInt(tabDuree[i]);
											}else{
												ressource[index].valueWE = parseInt(tabDuree[i]);												
											}
										}
									}
								}
							}
							//this.description = this.description.trim().replace(regex, "");
						} else {
							this.duree = null;
						}
						//alert('Probleme d\'estimation dans la tâche : ' + this.id + ' de la storie n° : ' + storyId + ' n\'est attribué et/ou n\'est pas estimée.\r\n https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId +'/tasks/' + this.id)
				}else{
					alert('Probleme d\'initales dans la tâche : ' + this.id + ' de la storie n° : ' + storyId + ' n\'est attribué.\r\n https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId +'/tasks/' + this.id)
					_this.setError('https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId +'/tasks/' + this.id, this.id)					
				}
			}
			//Tache solo
			else{
				//CHerche l'owner de la tache
				regex = /[A-Z]{2,}$/;
				var owner_initial;
				if (this.description.trim().match(regex)) {
				console.log('infosIMPORTANT',this.description.trim().match(regex));
					var taskMemeber = regex.exec(this.description.trim())[0];
					owner_initial = taskMemeber;
					this.description = this.description.trim().replace(regex, "");
					console.log('descro2', this.description)
					//La duree
					regex = /(\d)+$/;
					console.log('test20000', this.description.trim(), regex.exec(this.description.trim()))
					if (regex.exec(this.description.trim())) {
						var duree = regex.exec(this.description.trim())[0];
						console.log('la duree', duree)
						this.description = this.description.trim().replace(regex, "");
						if(!isWE){
							if (!ressource.find(x => x.initials == owner_initial)) {
								ressource.push({ initials: owner_initial, value: parseInt(duree) });
							} else {
								var index = ressource.findIndex(x => x.initials == owner_initial);
								if(ressource[index].value){
									ressource[index].value += parseInt(duree);
								}else{
									ressource[index].value = parseInt(duree);
								}
							}
						}else{
							if (!ressource.find(x => x.initials == owner_initial)) {
								ressource.push({ initials: owner_initial, valueWE: parseInt(duree) });
							} else {
								var index = ressource.findIndex(x => x.initials == owner_initial);
								if(ressource[index].valueWE){
									ressource[index].valueWE += parseInt(duree);
								}else{
									ressource[index].valueWE = parseInt(duree);
								}
							}
						}
					} else {
						alert('Probleme d\'estimation dans la tâche : ' + this.id + ' de la storie n° : ' + storyId + ' n\'est pas estimée.\r\n https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId +'/tasks/' + this.id)
						_this.setError('https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId +'/tasks/' + this.id, this.id)						
					}
				} else {
					alert('Probleme d\'initales dans la tâche : ' + this.id + ' de la storie n° : ' + storyId + ' n\'est attribué.\r\n https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId +'/tasks/' + this.id)
					_this.setError('https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId +'/tasks/' + this.id, this.id)					
				}

			}
		}else{
			alert('La tâche : ' + this.id + ' de la storie n° : ' + storyId + ' n\'est attribué et/ou n\'est pas estimée.\r\n https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId +'/tasks/' + this.id);
			_this.setError('https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId +'/tasks/' + this.id, this.id)			
		}
		// if (!this.complete && !toFactu) {
			
			// }else if(!this.complete && toFactu){
				
				// }
			});
			console.log('likjbhqefbvîujhoqzergvîjnkoerfb645645456+456+464566+64++4646+', ressource)
	return ressource;
}

function getTasksInfos(projectId, storyId, toFactu = false) {
	var myTempTasks = [];
	$.ajax({
		url: "https://www.pivotaltracker.com/services/v5/projects/" + projectId + "/stories/" + storyId + "/tasks",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-TrackerToken', 'b4a752782f711a7c564221c2b0c2d5dc');
		},
		async: false,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		processData: false,
		success: function (data) {
			myTempTasks = data;
		},
		error: function () {
			alert("Cannot get data");
		}
	});
	var ressource = [];
	//On assigne les différentes informations aux taches (durée, éxecutant, imgCllass)
	console.log('mytemptask', myTempTasks)
	if(!toFactu){
		var ressource =this.parseAndFillTasks(myTempTasks, storyId, projectId, false);
		console.log('zguegugugugugug', ressource)
	}else{
		var ressource =this.parseAndFillTasks(myTempTasks, storyId, projectId, true);
	
	// $.each(myTempTasks, function () {
	// 	if (!this.complete && !toFactu) {
	// 		console.log('complete');
	// 		var regexPP = /\d(\+\d)+$/;
	// 		var regexPP2 = /[A-Z]+(\+[A-Z]+)+$/;
	// 		//Taches PairPro sans noms
	// 		var tabDescrInfo = this.description.split('.-');
	// 		if (tabDescrInfo.length <= 1) {
	// 			tabDescrInfo = this.description.split('. -');
	// 		}
	// 		if (tabDescrInfo.length > 1) {
	// 			console.log('descro')
	// 			if (this.description.trim().match(regexPP) || this.description.trim().match(regexPP2)) {
	// 				regexPP2 = /[A-Z]+(\+[A-Z]+)/;
	// 				if (this.description.trim().match(regexPP2)){
	// 					var ownerBrut = regexPP2.exec(this.description.trim());
	// 					var owners = ownerBrut[0].split("+");
	// 					this.description = this.description.trim().replace(regexPP2, "");
	// 					regexPP = /\d+(\+\d+)+/;
	// 					if (this.description.trim().match(regexPP)) {
	// 						var tabDureeBrut = regexPP.exec(this.description.trim());
	// 						this.description = this.description.trim().replace(regexPP, "");
	// 						var tabDuree = tabDureeBrut[0].split('+');

	// 						if (tabDuree.length != owners.length) {
	// 							alert('La tâche de la storie : https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + ' contient une malformation');
	// 						} else {
	// 							console.log('PP1', owners, tabDuree)
	// 							for (var i in owners) {
	// 								if (!ressource.find(x => x.initials == owners[i])) {
	// 									ressource.push({ initials: owners[i], value: parseInt(tabDuree[i]) });
	// 								} else {
	// 									ressource[ressource.findIndex(x => x.initials == owners[i])].value += parseInt(tabDuree[i]);
	// 								}
	// 							}
	// 						}
	// 						this.description = this.description.trim().replace(regexPP, "");
	// 					} else {
	// 						this.duree = null;
	// 					}
	// 					this.isPairProg = true;
	// 				}
	// 			} else {
	// 				regexPP = /(\d)+$/;
	// 				//Tahe (simple) avec horaires sans Initial
	// 				if (this.description.trim().match(regexPP)) {
	// 					var duree = regexPP.exec(this.description.trim())[0];
	// 					this.description = this.description.trim().replace(regexPP, "");
	// 					regexPP = /([A-Z]+)/;
	// 					if (this.description.trim().match(regexPP)) {
	// 						var taskMemeber = regexPP.exec(this.description.trim())[0];
	// 						var owner_initial = taskMemeber;
	// 						console.log('N1')
	// 						if (!ressource.find(x => x.initials == taskMemeber)) {

	// 							ressource.push({ initials: taskMemeber, value: parseInt(duree) });
	// 						} else {
	// 							ressource[ressource.findIndex(x => x.initials == taskMemeber)].value += parseInt(duree);
	// 						}
	// 						this.description = this.description.trim().replace(regexPP, "");
	// 					} else if (memberInitial || taskMemeber) {
	// 						var owner_initial = (memberInitial ? memberInitial : taskMemeber);
	// 						console.log('N2')

	// 						if (!ressource.find(x => x.initials == owner_initial)) {
	// 							ressource.push({ initials: owner_initial, value: parseInt(duree) });
	// 						} else {
	// 							ressource[ressource.findIndex(x => x.initials == owner_initial)].value += parseInt(duree);
	// 						}
	// 					} else {
	// 						alert('La tâche de la storie : https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + ' contient une malformation');
	// 					}
	// 					//TacheSimple avec temps et intital
	// 				} else if (this.description.trim().match(/([A-Z]+)+$/)) {
	// 					regexPP = /([A-Z]+)+$/;
	// 					var owner_initial;
	// 					if (this.description.trim().match(regexPP)) {
	// 						var taskMemeber = regexPP.exec(this.description.trim())[0];
	// 						owner_initial = taskMemeber;
	// 						description = this.description.trim().replace(regexPP, "");
	// 					} else if (memberInitial || taskMemeber) {
	// 						owner_initial = (memberInitial ? memberInitial : taskMemeber);
	// 					} else {
	// 						alert('La tâche de la storie : https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + ' contient une malformation');
	// 					}
	// 					this.description = this.description.trim().replace(regexPP, "");

	// 					regexPP = /(\d)+$/;
	// 					console.log('test20000', this.description.trim(), regexPP.exec(this.description.trim()))
	// 					if (regexPP.exec(this.description.trim())) {
	// 						var duree = regexPP.exec(this.description.trim())[0];
	// 						this.description = this.description.trim().replace(regexPP, "");
	// 						console.log('N3', owner_initial, duree)

	// 						if (!ressource.find(x => x.initials == owner_initial)) {
	// 							ressource.push({ initials: owner_initial, value: parseInt(duree) });
	// 						} else {
	// 							ressource[ressource.findIndex(x => x.initials == owner_initial)].value += parseInt(duree);
	// 						}
	// 					} else {
	// 						alert('La tâche de la storie : https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + ' contient une malformation4');
	// 					}

	// 				} else {
	// 					alert('La tâche de la storie : https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + ' contient une malformation5');

	// 				}
	// 				// }
	// 			}
	// 		} else {
	// 			alert('La tâche de la storie n° : ' + storyId + ' contient une malformation5');
	// 		}
	// 	}else if(toFactu){
	// 		console.log('toFactu')
	// 		var regexPP = /\d1(\+\d)+$/;
	// 		var regexPP2 = /[A-Z]+(\+[A-Z]+)+$/;
	// 		//Taches PairPro sans noms
	// 		var tabDescrInfo = this.description.split('.-');
	// 		if (tabDescrInfo.length <= 1) {
	// 			tabDescrInfo = this.description.split('. -');
	// 		}
	// 		if (tabDescrInfo.length > 1) {
	// 			console.log('descro')
	// 			if (this.description.trim().match(regexPP) || this.description.trim().match(regexPP2)) {
	// 				regexPP2 = /[A-Z]+(\+[A-Z]+)/;
	// 				if (this.description.trim().match(regexPP2)) {
	// 					var ownerBrut = regexPP2.exec(this.description.trim());
	// 					var owners = ownerBrut[0].split("+");
	// 					this.description = this.description.trim().replace(regexPP2, "");
	// 					regexPP = /\d+(\+\d+)+/;
	// 					if (this.description.trim().match(regexPP)) {
	// 						var tabDureeBrut = regexPP.exec(this.description.trim());
	// 						this.description = this.description.trim().replace(regexPP, "");
	// 						var tabDuree = tabDureeBrut[0].split('+');

	// 						if (tabDuree.length != owners.length) {
	// 							alert('La tâche de la storie : https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + ' contient une malformation');
	// 						} else {
	// 							console.log('PP1', owners, tabDuree)
	// 							for (var i in owners) {
	// 								if (!ressource.find(x => x.initials == owners[i])) {
	// 									ressource.push({ initials: owners[i], value: parseInt(tabDuree[i]) });
	// 								} else {
	// 									ressource[ressource.findIndex(x => x.initials == owners[i])].value += parseInt(tabDuree[i]);
	// 								}
	// 							}
	// 						}
	// 						this.description = this.description.trim().replace(regexPP, "");
	// 					} else {
	// 						this.duree = null;
	// 					}
	// 					this.isPairProg = true;
	// 				}
	// 			} else {
	// 				regexPP = /(\d)+$/;
	// 				//Tahe (simple) avec horaires sans Initial
	// 				if (this.description.trim().match(regexPP)) {
	// 					var duree = regexPP.exec(this.description.trim())[0];
	// 					this.description = this.description.trim().replace(regexPP, "");
	// 					regexPP = /([A-Z]+)/;
	// 					if (this.description.trim().match(regexPP)) {
	// 						var taskMemeber = regexPP.exec(this.description.trim())[0];
	// 						var owner_initial = taskMemeber;
	// 						console.log('N1')
	// 						if (!ressource.find(x => x.initials == taskMemeber)) {

	// 							ressource.push({ initials: taskMemeber, value: parseInt(duree) });
	// 						} else {
	// 							ressource[ressource.findIndex(x => x.initials == taskMemeber)].value += parseInt(duree);
	// 						}
	// 						this.description = this.description.trim().replace(regexPP, "");
	// 					} else if (memberInitial || taskMemeber) {
	// 						var owner_initial = (memberInitial ? memberInitial : taskMemeber);
	// 						console.log('N2')

	// 						if (!ressource.find(x => x.initials == owner_initial)) {
	// 							ressource.push({ initials: owner_initial, value: parseInt(duree) });
	// 						} else {
	// 							ressource[ressource.findIndex(x => x.initials == owner_initial)].value += parseInt(duree);
	// 						}
	// 					} else {
	// 						alert('La tâche de la storie : https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + ' contient une malformation');
	// 					}
	// 					//TacheSimple avec temps et intital
	// 				} else if (this.description.trim().match(/([A-Z]+)+$/)) {
	// 					regexPP = /([A-Z]+)+$/;
	// 					var owner_initial;
	// 					if (this.description.trim().match(regexPP)) {
	// 						var taskMemeber = regexPP.exec(this.description.trim())[0];
	// 						owner_initial = taskMemeber;
	// 						description = this.description.trim().replace(regexPP, "");
	// 					} else if (memberInitial || taskMemeber) {
	// 						owner_initial = (memberInitial ? memberInitial : taskMemeber);
	// 					} else {
	// 						alert('La tâche de la storie : https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + ' contient une malformation');
	// 					}
	// 					this.description = this.description.trim().replace(regexPP, "");

	// 					regexPP = /(\d)+$/;
	// 					console.log('test30000', this.description.trim(), regexPP.exec(this.description.trim()))

	// 					if (regexPP.exec(this.description.trim())) {
	// 						var duree = regexPP.exec(this.description.trim())[0];
	// 						this.description = this.description.trim().replace(regexPP, "");
	// 						console.log('N3', owner_initial, duree)

	// 						if (!ressource.find(x => x.initials == owner_initial)) {
	// 							ressource.push({ initials: owner_initial, value: parseInt(duree) });
	// 						} else {
	// 							ressource[ressource.findIndex(x => x.initials == owner_initial)].value += parseInt(duree);
	// 						}
	// 					} else {
	// 						alert('La tâche de la storie : https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + ' contient une malformation4.1');
	// 					}

	// 				} else {
	// 					alert('La tâche de la storie : https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + ' contient une malformation5.1');

	// 				}
	// 				// }
	// 			}
	// 		} else {
	// 			alert('La tâche de la storie n° : ' + storyId + ' contient une malformation5');
	// 		}
	// 	}
	// });
}
	console.log('in da task', ressource)
	return ressource;
}

function manageResult(result, newInfos) {
	for (var i in newInfos) {
		if (newInfos[i]) {
			if (result.find(x => x.initials == newInfos[i].initials)) {
				result[result.findIndex(x => x.initials == newInfos[i].initials)].value += parseInt(newInfos[i].value);
			} else {
				result.push(newInfos[i]);
			}
		}
	}
	return result;
}

function calculateTasks(stories, projectId, toFactu = false) {
	//amo part
	var result = {
		amo: [],
		des: [],
		dev: []
	};
	console.log('les stories avant brassage', stories)
	if(stories){
		for (var i in stories.amo) {
			result.amo = manageResult(result.amo, getTasksInfos(projectId, stories.amo[i].id, toFactu));
		}
		for (var j in stories.des) {
			result.des = manageResult(result.des, getTasksInfos(projectId, stories.des[j].id, toFactu))
		}
		for (var k in stories.dev) {
			console.log(stories.dev[k])
			result.dev = manageResult(result.dev, getTasksInfos(projectId, stories.dev[k].id, toFactu))
		}
	}
	console.log('returnFactuProcess',result, toFactu);
	if(!toFactu){
		Backbone.trigger('returnProcess', result);
	}else{
		//Backbone.trigger('returnFactuProcess', result);
		return result;
	}
}

function getAcceptedStoriesAtDate(projectId, leftDate, rightDate, epic){
	var stories ={
		amo: [],
		des: [],
		dev: []
	};
	var storiesBonus ={
		amo: [],
		des: [],
		dev: []
	};
	var storiesContainer = $('#stories');
	var amoCont = storiesContainer.find('#amo');
	amoCont.html('');
	var desCont = storiesContainer.find('#des');
	desCont.html('');
	var devCont = storiesContainer.find('#dev');
	devCont.html('');
	//https://www.pivotaltracker.com/services/v5/projects/1621131/stories?with_label=commande 1 - 31 janvier 2018&with_state=accepted	
	//https://www.pivotaltracker.com/services/v5/projects/720865/stories?accepted_after=2017-12-31T00:00:00.000Z&accepted_before=2018-02-01T00:00:00.000Z
	$.ajax({
		url: "https://www.pivotaltracker.com/services/v5/projects/" + projectId + "/stories?accepted_after="+leftDate.add(-1,"days").toISOString() + "&accepted_before=" + rightDate.toISOString(),
		//url: 'https://www.pivotaltracker.com/services/v5/projects/720865/stories?accepted_after=2017-12-31T00:00:00.000Z&accepted_before=' +rightDate.toISOString(),
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-TrackerToken', 'b4a752782f711a7c564221c2b0c2d5dc');
		},
		async: false,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		processData: false,
		success: function (data) {
			temp_stories = manageResult(data);
			$.each(temp_stories, function () {
				var labels = this.labels.map(o => o.name);
				if(labels.indexOf(epic) != -1){
					this.isBonus = false;
				}else{
					this.isBonus = true;
				}
				for (var i in labels) {
					if (labels[i] == 'amo') {
						if(this.isBonus){
							storiesBonus.amo.push(this);
						}else{
							stories.amo.push(this);
						}
						amoCont.append('<li>' + this.name + '</li>');
					} else if (labels[i] == 'des') {
						if(this.isBonus){
							storiesBonus.des.push(this);
						}else{
							stories.des.push(this);
						}
						desCont.append('<li>' + this.name + '</li>');
					} else if (labels[i] == 'dev') {
						if(this.isBonus){
							storiesBonus.dev.push(this);
						}else{
							stories.dev.push(this);
						}
						devCont.append('<li>' + this.name + '</li>');
					}

				}
			})
			console.log('stories', {stories:stories,bonus:storiesBonus});
		},
		error: function () {
			alert("Cannot get data");
		}
	});
	// $.ajax({
	// 	//url: "https://www.pivotaltracker.com/services/v5/projects/" + projectId + "/stories?accepted_after="+leftDate.add(-1,"days").toISOString() + "&accepted_before=" + rightDate.add(1, "days").toISOString(),
	// 	url: 'https://www.pivotaltracker.com/services/v5/projects/720865/stories?with_label=commande 1 - 31 janvier 2018&with_state=accepted',
	// 	beforeSend: function (xhr) {
	// 		xhr.setRequestHeader('X-TrackerToken', 'b4a752782f711a7c564221c2b0c2d5dc');
	// 	},
	// 	async: false,
	// 	type: 'GET',
	// 	dataType: 'json',
	// 	contentType: 'application/json',
	// 	processData: false,
	// 	var idList
	// 	success: function (data) {
	// 		temp_stories = manageResult(data);
	// 		$.each(temp_stories, function () {
	// 			var labels = this.labels.map(o => o.name);
	// 			for (var i in labels) {
	// 				if (labels[i] == 'amo') {
	// 					stories.amo.push(this);
	// 					amoCont.append('<li>' + this.name + '</li>');
	// 				} else if (labels[i] == 'des') {
	// 					stories.des.push(this);
	// 					desCont.append('<li>' + this.name + '</li>');
	// 				} else if (labels[i] == 'dev') {
	// 					stories.dev.push(this);
	// 					devCont.append('<li>' + this.name + '</li>');
	// 				}

	// 			}
	// 		})
	// 		console.log('stories', stories);
	// 	},
	// 	error: function () {
	// 		alert("Cannot get data");
	// 	}
	// });
	return {stories:stories,bonus:storiesBonus};
}

function calculateFacturation(){
	
}