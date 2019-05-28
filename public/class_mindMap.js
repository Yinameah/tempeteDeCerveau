/**
 * Cette classe contient les données et les fonctions relatives à la mindmap. Elle est persistente dans l'application et possède
 * une fonction de rendu en fonction du projet lancé, qui réinstancie toutes les données.
 */
class mindMap {
	/**
	 * Le constructeur de la mindMap crée les éléments graphiques principaux de la fenêtre (header, paneau de paramétrage, zones
	 * destinées à contenir les graphiques) ainsi que les données fixes de la classe. Les opérations relatives au projet sont 
	 * effectuées dans la fonction render().
	 */
	constructor(database, authentificateur){
		/* Initialisation de la liaison avec la base de données */
		this.database = database;
		/* Lien vers la classe d'autentification */
		this.authentificateur = authentificateur;

		this.nodes = new Map(); /* Conteneur de tous les noeuds du graphe. */
		this.selectedNode = -1; /* la valeur -1 indique qu'aucun noeud est sélectionné */
		this.editedNode = -1; /* la valeur -1 indique qu'aucun noeud est en cours d'édition */
		this.unsubscribe = function(){
			console.log("La fonction this.unsubscribe() n'a pas été définie.");
		}; /* Cette fontion ne devrait pas être appelée avant qu'on ait invoqué mindmap.render() */

		/* Création des graphismes fixes de la page (bandeau principal, espace pour le graphique) */
		this.mindmapHeader = new mindmapHeader(this.headerCallback.bind(this), this.disconnectCallback.bind(this));

		this.mindmapdiv = document.createElement("div"); /* Va contenir la mindmap */
		this.mindmapdiv.id = "mindmap_div";
		this.chartDiv = document.createElement("div"); /* Va contenir le diagramme de Gantt */
		this.chartDiv.id = "chart_div";
		this.chartDiv.className = "wrapper";
		this.chartDiv.style.display = "none";
		
		this.ganttchart = new ganttChart(this.chartDiv);

		/* Génération du paneau de paramétrage des noeuds */
		this.settingspanel = new settingsPanel(this.changeNodeSettings.bind(this));

		
		
		console.log("Mindmap initialisée");
	}

	/**
	 * Callback appelé quand une touche est appuyée.
	 * La touche Escape permet de sortir d'une sélection sans sauver les modifications
	 * La touche Enter en mode édition permet de sortir d'une sélection en sauvant les modifications
	 * La touche Enter hors mode édition permet, lorsqu'un noeud est sélectionné, de lui créer un noeud dépendant.
	 * La touche Delete permet de supprimer le noeud sélectionné.
	 * @param {object} event événement contant la touche pressée.
	 */
	keypressed(event){
		if(event.keyCode == 27){/* ESC */
			this.clearSelection();
		}
		else if(event.keyCode == 13){ /* ENTER */
			if(this.editedNode >= 0){
				this.saveEditted();
				this.clearSelection();
			}
			else if(this.selectedNode >= 0){
				this.createChildNode(this.selectedNode);
			}
		}
		else if(event.keyCode == 46){ /* DEL */
			this.deleteSelected();
		}
	}


	/**
	 * Fonction de callback transmise à l'instance du header, permettant de piloter l'affichge mindmap/gantt.
	 * @param {booléen} mindmapview Indique si on doit afficher la mindmap (true) ou le diagramme de Gantt (false)
	 */
	headerCallback(mindmapview){
		if(mindmapview){
			this.mindmapdiv.style.display = "block";
			this.chartDiv.style.display = "none";
		}
		else{
			this.mindmapdiv.style.display = "none";
			this.chartDiv.style.display = "block";
			this.ganttchart.render(this.nodes);
		}
	}


	/**
	 * Callback donnée à la classe du header, permet de déclencher la fonction de déconnexion de l'authentification.
	 */
	disconnectCallback(){
		this.remove();
		this.authentificateur.disconnect();
	}


	/**
	 * Fonction de callback invoquée lorsqu'il y a un changement dans la base de données.
	 * @param {DocumentChanges[]} docchanges 
	 */
	listenerCallback(docchanges){
		var self = this;
		docchanges.forEach(function(change){
			var nodeId = Number(change.doc.id);
			var nodeData = change.doc.data();
			if (change.type === "added"){
				/* Ajout d'un noeud s'il n'existe pas encore. */
				if(self.nodes.has(nodeId) == false){
					var originpoint = self.getNodeOrigin(nodeData['parentnode']);
					self.nodes.set(nodeData["id"], new node(self.mindmapdiv, nodeData,originpoint[0], originpoint[1],
						self.deleteChildren.bind(self), self.updateChildrenWires.bind(self), self.selectNode.bind(self),
						self.editNode.bind(self), self.database));
					self.nodes.get(nodeData["id"]).render();
				}
			}
			if (change.type === "modified"){
				self.nodes.get(nodeId).updateNode(nodeData);
			}
			if (change.type === "removed"){
				if(self.nodes.has(nodeId)){
					self.deleteChildren(nodeId);
					self.nodes.get(nodeId).delete();
				}
			}
		});
	}

	/**
	 * Affice tous les noeuds du projet.
	 */
	renderAllNodes(){
		this.nodes.forEach(function(element){
			element.render();
		});
	}


	/**
	 * Renvoie le point central d'un noeud (point de départ du lien).
	 * @param {number} nodeId identifiant du noeud dont on cherche le centre.
	 */
	getNodeOrigin(nodeId){
		var x = 0, y = 0;
		var elem = this.nodes.get(nodeId);
		if(elem){
			x = elem.x + (elem.width/2);
			y = elem.y + (elem.height/2);
		}
		return [x,y];
	}


	/**
	 * Création d'un noeud flottant (niveau 0), tant au niveau du graphique que de la base de données.
	 * @param {object} event 
	 */
	createBaseNode(event){
		event.preventDefault();
		var self = this;
		this.database.getNewNodeId().then(function(newId){
			var emptynode = {"id": newId, "level": 0, "parentnode": 0, "x": event.pageX, "y": event.pageY, "starttime": null, 
				"endtime": null, "content": "Nouvel élément", "type": 0, "priority": 0, "users": [], "status": 0, "link": "",
				"archive": false};
			self.clearSelection();
			self.nodes.set(newId, new node(self.mindmapdiv, emptynode,0,0,self.deleteChildren.bind(self),
							self.updateChildrenWires.bind(self), self.selectNode.bind(self),self.editNode.bind(self), self.database));
			self.nodes.get(newId).editing = true;
			self.editedNode = newId;
			self.database.addNode(self.nodes.get(newId));
			self.nodes.get(newId).render();
		}).catch(function(error){
			console.log(error);
		});
		
	}


	/**
	 * Création d'un noeud dépendant, tant au niveau du graphique que de la base de données.
	 * @param {number} parentNodeId 	Identifiant du noeud parent.
	 */
	createChildNode(parentNodeId){
		var x = 0, y = 0, originx = 0, originy = 0, level = 0;
		var self = this;
		if(this.nodes.has(parentNodeId)){
			var parentNode = this.nodes.get(parentNodeId);
			level = parentNode.level + 1;
			originx = parentNode.x + parentNode.width/2;
			originy = parentNode.y + parentNode.height/2;
			/* La position du nouveau noeud va dépendre de la direction de la dernière liaision. */
			if(parentNode.x < parentNode.originx){
				x = parentNode.x - 200;
			}
			else{
				x = parentNode.x + 200;
			}
			if(parentNode.y < parentNode.originy){
				y = parentNode.y + 100;
			}
			else{
				y = parentNode.y - 100;
			}
		}
		else{
			/* Si le noeud parent n'est pas défini, on crée un noeud flottant. */
			var level = 0;
			console.log("Erreur: paramètre invalide dans createChildNode()");
		}
		this.database.getNewNodeId().then(function(newId){
			var emptynode = {"id": newId, "level": level, "parentnode": parentNodeId, "x": x, "y": y,"starttime": null, 
					"endtime": null, "content": "Nouvel élément", "type": 0, "priority": 0, "users": [], "status": 0, "link": "",
					"archive": false};
			self.clearSelection();
			self.nodes.set(newId, new node(self.mindmapdiv, emptynode,originx,originy,self.deleteChildren.bind(self),
						self.updateChildrenWires.bind(self), self.selectNode.bind(self),self.editNode.bind(self),self.database));
			self.nodes.get(newId).editing = true;
			self.editedNode = newId;
			self.database.addNode(self.nodes.get(newId));
			self.nodes.get(newId).render();
		}).catch(function(error){
			console.log(error);
		});
	}

	
	/**
	 * Modifie toutes les liaisons des noeuds dépendant du noeud nodeId. Utile lorsqu'on bouge un noeud dont dépendent d'autres
	 * noeuds.
	 * @param {number} nodeId Noeud dont on veut modifier les liaisons.
	 */
	updateChildrenWires(nodeId){
		var originx = 0, originy = 0;
		if(this.nodes.has(nodeId)){
			var node = this.nodes.get(nodeId);
			originx = node.x + node.width/2;
			originy = node.y + node.height/2;
		}
		this.nodes.forEach(function(node){
			if(node.parentNode == nodeId){
				if(node.wire != null){
					node.wire.setOrigin(originx,originy);
					node.wire.render();
				}
			}
		});
	}


	/**
	 * Supprime tous les noeuds dépendant du noeud nodeId.
	 * @param {number} nodeId 
	 */
	deleteChildren(nodeId){
		var self = this;
		this.nodes.forEach(function(currentnode){
			if(currentnode.parentNode == nodeId){
				currentnode.delete();
				self.database.deleteNode(currentnode.nodeId);
			}
		});
	}

	/**
	 * Sélection d'un noeud.
	 * @param {number} nodeId Identifiant du noeud à sélectionner.
	 */
	selectNode(nodeId){
		if(this.selectedNode >= 0){
			this.clearSelection();
		}
		this.settingspanel.showPanel(this.nodes.get(nodeId));
		this.selectedNode = nodeId;
		this.nodes.get(nodeId).selected = true;
		this.nodes.get(nodeId).render();
	}

	/**
	 * Désélection du noeud sélectionné.
	 */
	clearSelection(){
		this.clearEdition();
		this.settingspanel.hidePanel();
		if(this.selectedNode >= 0){
			this.nodes.get(this.selectedNode).selected = false;
			this.nodes.get(this.selectedNode).render();
		}
		this.selectedNode = -1;
	}

	/**
	 * Édition d'un noeud.
	 * @param {number} nodeId Identifiant du noeud à éditer.
	 */
	editNode(nodeId){
		if(this.editedNode >= 0){
			this.clearEdit();
		}
		this.editedNode = nodeId;
		this.nodes.get(nodeId).editing = true;
		this.nodes.get(nodeId).render();
	}

	/**
	 * Modification des paramètres du noeud sélectionné. Les nouveaux paramètres sont issus du panneau de
	 * paramétrage.
	 */
	changeNodeSettings(){
		if(this.nodes.has(this.selectedNode)){
			var currentNode = this.nodes.get(this.selectedNode);
			currentNode.type = this.settingspanel.type;
			currentNode.priority = this.settingspanel.priority;
			currentNode.users = this.settingspanel.users;
			currentNode.status = this.settingspanel.status;
			currentNode.starttime = this.settingspanel.starttime;
			currentNode.endtime = this.settingspanel.endtime;
			currentNode.render();
			this.database.setNodeSettings(this.selectedNode,currentNode.type,currentNode.priority,currentNode.users,
										currentNode.status, currentNode.starttime, currentNode.endtime, currentNode.archive);
		}
	}

	/**
	 * Permet de sortir du mode édition.
	 */
	clearEdition(){
		if(this.editedNode >= 0){
			if(this.nodes.has(this.editedNode)){ /* Nécessaire pour le cas où le noeud aurait été supprimé. */
				this.nodes.get(this.editedNode).editing = false;
				this.nodes.get(this.editedNode).render();
			}
		}
		this.editedNode = -1;
	}
	
	/**
	 * Sauvegarde les  modification du noeud en cours d'édition.
	 */
	saveEditted(){
		var self = this;
		this.nodes.forEach(function(node){
			if(node.editing){
				node.saveEdition();
			}
		});
	}

	/**
	 * Suppression du noeud sélectionné.
	 */
	deleteSelected(){
		if(this.selectedNode >= 0){
			this.deleteChildren(this.selectedNode);
			this.nodes.get(this.selectedNode).delete();
			this.nodes.delete(this.selectedNode);
			this.database.deleteNode(this.selectedNode);
			this.selectedNode = -1;
		}
	}

	/**
	 * Enclenche les callbacks, lors du rendu de la mindmap.
	 */
	enableCallbacks(){
		/* Callbacks pour les clics de souris */
		document.onmousedown = function(){
			/* On sauvegarde la modificatino dans le noeud avant de déselectionner */
			this.saveEditted();
			this.clearSelection();
		}.bind(this);
		document.ondblclick = this.createBaseNode.bind(this);

		/* Callback invoquée lorsqu'on appuie sur une touche */
		document.body.onkeydown = this.keypressed.bind(this);
	}

	/**
	 * permet de désactiver les fonctions de callback lors du retrait de la mindmap.
	 */
	disableCallbacks(){
		document.onmousedown = null;
		document.ondblclick = null;
		document.body.onkeydown = null;
	}
	

	/**
	 * Effectue le rendu du projet dans la mindmap.
	 * @param {String} project nom du projet à lier.
	 */
	render(projectRef){
		this.mindmapHeader.render();

		document.body.appendChild(this.chartDiv);
		document.body.appendChild(this.mindmapdiv);

		this.database.linkProject(projectRef);
		this.unsubscribe = this.database.createCollectionListener("Nodes",this.listenerCallback.bind(this));

		this.enableCallbacks();
	}

	/**
	 * Détruit tous les éléments relatifs au projet (la mindmap reste intacte) et liée à sa base de données.
	 */
	remove(){
		this.disableCallbacks();
		this.unsubscribe();

		
		this.selectedNode = -1;
		this.editedNode = -1;

		this.settingspanel.remove();
		this.mindmapHeader.remove();

		this.nodes.forEach(function(element){
			element.delete();
		});
		this.nodes.clear();

		this.ganttchart.remove();

		if(this.chartDiv.parentNode == document.body){
			document.body.removeChild(this.chartDiv);
		}
		if(this.mindmapdiv.parentNode == document.body){
			document.body.removeChild(this.mindmapdiv);
		}
	}
}
