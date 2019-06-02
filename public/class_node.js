/**
 * Cette classe représente un noeud du graphe. Il contient à la fois les éléments issus de la base de donnée
 * et les éléments liés à sa représentation graphique.
 */
class node {
	/***********************************************************************************************
	*	Constructeur du neud du graphe
	*	@param parentDiv objet graphique contenant le noeud.
	*	@param nodedata objet contenant les informations sur le noeud à créer, tels que stockées dans la base de données.
	*	@param originx	position d'origine du lien - x
	*	@param originy	position d'origine du lien - y
	*	@param deleteChildren callback appelée au moment de supprimer le noeud, qui a pour effet de supprimer les noeuds dépendants.
	*	@param updateChildrenWires callback appelé lorsque la position du noeud est modifée, pour modifier les liaisons filles.
	*	@param selectNode	callback appelé lorsqu'on sélectionne ce noeud, pour déselectionner les autres noeuds.
	*	@param editNode		callback appelé lorsqu'on édite ce noeud, pour arrêter l'édition des autres noeuds.
	*	@param database		référence vers l'objet contenant les fonctions de la base de données, pour effectuer les mises à jour
	**************************************************************************************************/
	constructor(parentDiv, nodedata,originx,originy,deleteChildren,updateChildrenWires,selectNode,editNode,database){
		this.parentDiv = parentDiv;
		this.nodeId = nodedata["id"];
		this.level = nodedata["level"];
		this.x = nodedata["x"];
		this.y = nodedata["y"];
		this.content = nodedata["content"];
		this.setDimensions();

		if(nodedata["starttime"] != null){
			this.starttime = nodedata["starttime"].toDate();
		}
		else{
			this.starttime = null;
		}
		if(nodedata["endtime"] != null){
			this.endtime = nodedata["endtime"].toDate();
		}
		else{
			this.endtime = null;
		}
		
		this.todolist = null;
		this.parentNode = nodedata["parentnode"];
		this.database = database;
		this.type = nodedata["type"];
		this.priority = nodedata["priority"];
		this.users = nodedata["users"];
		this.status = nodedata["status"];
		this.link = nodedata["link"];
		this.archive = nodedata["archive"];

		/* Création des éléments graphiques - sans leur contenu */
		this.graphnode = document.createElement("div");
		this.bgbox = document.createElement("div"); /* Arrière plan blanc pour cacher la liaison en transparence */
		this.graphnode.setAttribute("id", "node" + this.nodeId);
		this.bgbox.setAttribute("id", "bgnode" + this.nodeId);
		
		this.nodeContent = document.createElement("div");
		this.graphnode.appendChild(this.nodeContent);
		this.nodeText = document.createElement("span");
		this.nodeContent.appendChild(this.nodeText);
		this.editText = document.createElement("div");
		this.editText.style.display = "none";
		this.graphnode.appendChild(this.editText);
		this.textbox = document.createElement("input");
		this.editText.appendChild(this.textbox);

		

		/* Fonctions de callback */
		this.deleteChildren = deleteChildren;
		this.updateChildrenWires = updateChildrenWires;
		this.selectNode = selectNode;
		this.editNode = editNode;

		/* Constantes pour les styles à changer dynamiquement */
		this.TYPESCLASSESNAMES = ["topic", "subject", "idea", "task", "comment"];
		this.PRIORITYCLASSESNAMES = ["nopriority","lowpriority","mediumpriority","highpriority"];
		this.STATUSCLASSESNAMES = ["","checked","dismissed"];
		
		/* Création du lien avec le noeud parent, si existant */
		if(this.level > 0){
			var destx = this.x + (this.width/2);
			var desty = this.y + (this.height/2);
			this.wire = new wire(this.parentDiv, originx, originy, destx, desty,this.nodeId);
		}
		else{
			this.wire = null;
		}
	}

	/**
	 * Mise à jour du contenu du noeud.
	 * @param {object} nodedata Nouvelles données du noeud.
	 */
	updateNode(nodedata){
			this.level = nodedata["level"];
			this.x = nodedata["x"];
			this.y = nodedata["y"];
			this.content = nodedata["content"];
			this.setDimensions();
			if(nodedata["starttime"] != null){
				this.starttime = nodedata["starttime"].toDate();
			}
			else{
				this.starttime = null;
			}
			if(nodedata["endtime"] != null){
				this.endtime = nodedata["endtime"].toDate();
			}
			else{
				this.endtime = null;
			}
			this.parentNode = nodedata["parentnode"];
			this.type = nodedata["type"];
			this.priority = nodedata["priority"];
			this.users = nodedata["users"];
			this.status = nodedata["status"];
			/* Si le noeud possède une liaison (i.e. si ce n'est pas une racine), on modifie sa liaison. */
			if(this.wire != null){
				this.wire.setDestination(this.x + (this.width/2), this.y + (this.height/2));
			}
			/* On met à jour les liaisons des noeuds dépendants */
			this.updateChildrenWires(this.nodeId);
			/* Rendu du noeud */
			this.render();
	}


	/**
	 * Fonction qui déduit la largeur du noeud à partir de la longueur de son contenu, et qui fixe ses dimensions.
	 */
	setDimensions(){
		this.width = (this.content.length*10) + 20;
		if(this.width < 80){
			this.width = 80;
		}
		this.height = 20;
	}


	/**
	 * Sauve les modifications effectuées lors de l'édition dans la base de données et met à jour la taille du noeud.
	 */
	saveEdition(){
		this.content = this.textbox.value;
		this.database.setNodeContent(this.nodeId,this.content);
		this.setDimensions();
	}

	

	/**
	 * Callback appelée lorsqu'on clique sur un noeud. Elle sélectionne le noeud et enclenche les callbacks
	 * qui permettent de le déplacer.
	 * @param {object} event 
	 */
	dragNode(event){
		var initialx = 0, initialy = 0, offsetx = 0, offsety = 0;
		var self = this;
		/* Permet d'éviter d'autres effets du click, comme des sélections par exemple */
		event.preventDefault();
		event.stopPropagation();

		/* Sélection du noeud */
		this.selectNode(this.nodeId);
		
		initialx = event.pageX;
		initialy = event.pageY;

		document.onmouseup = dragEnd;
		document.onmousemove = dragMove;

		/**
		 * Callback appelée lorsque le noeud est bougé. Elle met à jour la représentation graphique du noeud
		 * mais ne met pas encore à jour la base de données.
		 * @param {object} e 
		 */
		function dragMove(e){
			/* Calcul du mouvement qui a été effectué */
			offsetx = e.pageX - initialx;
			offsety = e.pageY - initialy;
			initialx = e.pageX;
			initialy = e.pageY;
			self.x = self.x + offsetx;
			self.y = self.y + offsety;

			/* Si le noeud possède une liaison (i.e. si ce n'est pas une racine), on modifie sa liaison. */
			if(self.wire != null){
				self.wire.setDestination(self.x + (self.width/2), self.y + (self.height/2));
			}

			/* On met à jour les liaisons des noeuds dépendants */
			self.updateChildrenWires(self.nodeId);

			/* On finit par lancer un rendu du tout */
			//self.render(true, false);
			self.changeNodePosition();
		}

		/**
		 * Callback appelée lorsqu'on relâche le clic de souris. annule les callbacks de mouvement et met à jour la position
		 * du noeud dans la base de données.
		 */
		function dragEnd(){
			document.onmouseup = null;
			document.onmousemove = null;
			self.database.setNodePosition(self.nodeId, self.x, self.y);
		}
	}

	changeNodePosition(){
		this.graphnode.setAttribute('Style', "left:" + String(this.x) + "px;top:" + String(this.y) + "px;width:" + String(this.width) +
								"px;height:" + String(this.height) + "px");
		this.bgbox.setAttribute('Style', "left:" + String(this.x) + "px;top:" + String(this.y) + "px;width:" + String(this.width) +
								"px;height:" + String(this.height) + "px");
		/* Rendu de la liaison, si elle existe */
		if(this.wire != null){
			this.wire.render();
		}
	}

	/**
	 * Rendu graphique du noeud.
	 */	
	render(selected, edited){
		/* Ajout des éléments graphiques à la page */
		this.parentDiv.appendChild(this.graphnode);
		this.parentDiv.appendChild(this.bgbox);

		var styleLevel = this.level;
		if(styleLevel > 3){ /* Le CSS propose des styles pour les noeuds de niveau 0, 1, 2, 3. Au-delà, tous prennent le niveau 3. */
			styleLevel = 3;
		}
		/* Choix du style en fonction de l'état sélectionné/déselectionné. */
		this.graphnode.setAttribute('Style', "left:" + String(this.x) + "px;top:" + String(this.y) + "px;width:" + String(this.width) +
								"px;height:" + String(this.height) + "px");
		this.bgbox.setAttribute('Style', "left:" + String(this.x) + "px;top:" + String(this.y) + "px;width:" + String(this.width) +
								"px;height:" + String(this.height) + "px");

		var classe = "box box" + styleLevel + " " + this.TYPESCLASSESNAMES[this.type] + 
						" " + this.PRIORITYCLASSESNAMES[this.priority] + " " + this.STATUSCLASSESNAMES[this.status];
		if(selected){
			classe = classe + " selected";
			this.graphnode.style.zIndex = "5";
		}
		else{
			this.graphnode.style.zIndex = String(styleLevel);
		}

		this.graphnode.className = classe;
		this.bgbox.className = "bgbox " +  this.TYPESCLASSESNAMES[this.type];
		
		this.nodeContent.className = "nodeContent";
		this.nodeText.className = "nodeText";
		this.nodeText.innerHTML = this.content;
		this.editText.className = "nodeEdit";
		this.textbox.type = "text";
		this.textbox.id = "texteditor";

		if(edited){
			this.editText.style.display = "block";
			this.nodeContent.style.display = "none";
			this.textbox.focus();
		}
		else{
			/* Si on n'est pas en cours d'édition, le contenu du champ d'édition du texte (caché) prend la valeur du contenu
			du noeud. De cette manière, quand on voudra l'éditer, il contiendra déjà la bonne chaîne de caractères. */
			this.textbox.value = this.content;
			this.editText.style.display = "none";
			this.nodeContent.style.display = "block";
		}
		
		
		/* Enclenchement des callbacks de click sur le noeud */
		this.graphnode.onmousedown = this.dragNode.bind(this);
		/* Le callback du double click sur le noeud est doublé car le double clic sur le span n'est pas
		transmis au DIV */
		this.nodeContent.ondblclick = function(event){
			event.stopPropagation();
			this.editNode(this.nodeId);
		}.bind(this);
		this.graphnode.ondblclick = function(event){
			event.stopPropagation();
			this.editNode(this.nodeId);
		}.bind(this);
		/* On doit éviter qu'un click dans la zone de texte à modifier soit transmis à l'arrière-plan */
		this.textbox.onmousedown = function(event){
			event.stopPropagation();
		};

		/* Rendu de la liaison, si elle existe */
		if(this.wire != null){
			this.wire.render();
		}
	}

	/**
	 * Retire la représentation graphique du noeud, ainsi que sa liaison.
	 */
	delete(){
		if(this.wire != null){
			this.wire.delete();
		}
		this.parentDiv.removeChild(this.graphnode);
		this.parentDiv.removeChild(this.bgbox);
	}
}