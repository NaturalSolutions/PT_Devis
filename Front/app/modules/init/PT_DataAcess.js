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
			myProjects = data;
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
		url: "https://www.pivotaltracker.com/services/v5/projects/" + projectId + "/stories?with_label=" + epicLabel.toLowerCase()	,
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

function getTasksInfos(projectId,storyId){
	var mytasks = [];
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
	$.each(myTempTasks, function () {
		if (!this.complete) {
			var regexPP = /\d(\+\d)+$/;
			var regexPP2 = /[A-Z]+(\+[A-Z]+)+$/;
			//Taches PairPro sans noms
			var tabDescrInfo = this.description.split('.-');
			if (tabDescrInfo.length <= 1) {
				tabDescrInfo = this.description.split('. -');
			}
			if (tabDescrInfo.length > 1) {
				if (this.description.trim().match(regexPP) || this.description.trim().match(regexPP2)) {
					regexPP2 = /[A-Z]+(\+[A-Z]+)/;
					if (this.description.trim().match(regexPP2)) {
						var ownerBrut = regexPP2.exec(this.description.trim());
						var owners = ownerBrut[0].split("+");
						this.description = this.description.trim().replace(regexPP2, "");
						regexPP = /\d+(\+\d+)+/;
						if (this.description.trim().match(regexPP)) {
							var tabDureeBrut = regexPP.exec(this.description.trim());
							this.description = this.description.trim().replace(regexPP, "");
							var tabDuree = tabDureeBrut[0].split('+');

							if(tabDuree.length != owners.length){
								alert('La tâche de la storie : https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + ' contient une malformation');
							}else{
								console.log('PP1',owners, tabDuree)
								for(var i in owners){
									if(!ressource.find(x => x.initials == owners[i])){
										ressource.push({initials : owners[i], value : parseInt(tabDuree[i])});
									}else{
										ressource[ressource.findIndex(x => x.initials == owners[i])].value += parseInt(tabDuree[i]);
									}
								}
							}
							this.description = this.description.trim().replace(regexPP, "");
						} else {
							this.duree = null;
						}
						this.isPairProg = true;
					}
				} else {
					regexPP = /(\d)+$/;
					//Tahe (simple) avec horaires sans Initial
					if (this.description.trim().match(regexPP)) {
						var duree = regexPP.exec(this.description.trim())[0];
						this.description = this.description.trim().replace(regexPP, "");
						regexPP = /([A-Z]+)/;
						if (this.description.trim().match(regexPP)) {
							var taskMemeber = regexPP.exec(this.description.trim())[0];
							var owner_initial = taskMemeber;
							console.log('N1')
							if(!ressource.find(x => x.initials == taskMemeber)){
								
								ressource.push({initials : taskMemeber, value : parseInt(duree)});
							}else{
								ressource[ressource.findIndex(x => x.initials == taskMemeber)].value += parseInt(duree);
							}							
							this.description = this.description.trim().replace(regexPP, "");
						} else if (memberInitial || taskMemeber) {
							var owner_initial = (memberInitial ? memberInitial : taskMemeber);
							console.log('N2')
							
							if(!ressource.find(x => x.initials == owner_initial)){
								ressource.push({initials : owner_initial, value : parseInt(duree)});
							}else{
								ressource[ressource.findIndex(x => x.initials == owner_initial)].value += parseInt(duree);
							}	
						} else {
							alert('La tâche de la storie : https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + ' contient une malformation');
						}
						//TacheSimple avec temps et intital
					} else if (this.description.trim().match(/([A-Z]+)+$/)) {
						regexPP = /([A-Z]+)+$/;
						var owner_initial;
						if (this.description.trim().match(regexPP)) {
							var taskMemeber = regexPP.exec(this.description.trim())[0];
							owner_initial = taskMemeber;
							description = this.description.trim().replace(regexPP, "");
						} else if (memberInitial || taskMemeber) {
							owner_initial = (memberInitial ? memberInitial : taskMemeber);
						} else {
							alert('La tâche de la storie : https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + ' contient une malformation');
						}
						this.description = this.description.trim().replace(regexPP, "");
						
						regexPP = /(\d)+$/;
						if (regexPP.exec(this.description.trim())) {				
							var duree = regexPP.exec(this.description.trim())[0];
							this.description = this.description.trim().replace(regexPP, "");
							console.log('N3',owner_initial, duree )
							
							if(!ressource.find(x => x.initials == owner_initial)){
								ressource.push({initials : owner_initial, value : parseInt(duree)});
							}else{
								ressource[ressource.findIndex(x => x.initials == owner_initial)].value += parseInt(duree);
							}							
						} else {
							alert('La tâche de la storie : https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + ' contient une malformation4');
						}
						
					} else {
						alert('La tâche de la storie : https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + ' contient une malformation5');
						
					}
					// }
				}				
			} else {
				alert('La tâche de la storie n° : ' + storyId + ' contient une malformation5');
			}
		}
	});
	return ressource;
}

function manageResult(result, newInfos){
	for(var i in newInfos){
		if(newInfos[i]){
		if(result.find(x => x.initials == newInfos[i].initials)){
			result[result.findIndex(x => x.initials == newInfos[i].initials)].value += parseInt(newInfos[i].value);
		}else{
			result.push(newInfos[i]);
		}
	}
	}
	return result;
}

function calculateTasks(stories, projectId){
	//amo part
	var result = {
		amo:[],
		des:[],
		dev:[]
	};
	for(var i in stories.amo){
//		result.amo = manageResult(result.amo,getTasksInfos(projectId, stories.amo[i].id)); 
result.amo = manageResult(result.amo,getTasksInfos(projectId, stories.amo[i].id)); 
}
for(var j in stories.des){
	result.des = manageResult(result.des,getTasksInfos(projectId, stories.des[j].id))
}
for(var k in stories.dev){
	console.log(stories.dev[k])
		result.dev = manageResult(result.dev,getTasksInfos(projectId, stories.dev[k].id))
	}
	console.log(result);
	Backbone.trigger('returnProcess', result);
}