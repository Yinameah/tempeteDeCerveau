/**
 * La classe décrit le header de l'application, contenant les boutons permettant d'afficher la mindmap ou le diagramme
 * de Gantt.
 * TODO ajouter un lien pour changer de projet, un logo, le titre du projet.
 */
class mindmapHeader {
	/**
	 * Instancie les différents éléments du header du projet.
	 * @param {Function} displaycallback callback appelée lorsqu'on clique sur mindmap ou diagramme de gantt
	 * @param {Fonction} signoutcallback callback appelée lorsqu'on clique sur le lien pour se déconnecter.
	 */
	constructor(displaycallback, signoutcallback){
		this.mindmapview = true;

		this.pageHeader = document.createElement("div");
		this.pageHeader.className = "pageHeader";

		
		/* Boutons de rendu */
		this.viewButtons = document.createElement("div");
		this.viewButtons.className = "viewBtnsContainer";

		this.mindMapButton = document.createElement("button");
		this.mindMapButton.className = "viewBtn";
		this.mindMapButton.innerHTML = "Carte de cerveau";
        this.mindMapButton.onclick = function(){
			this.mindmapview = true;
			displaycallback(this.mindmapview);
		}.bind(this);
		this.ganttButton = document.createElement("button");
		this.ganttButton.innerHTML = "Diagramme de Gantt";
        this.ganttButton.onclick = function(){
			this.mindmapview = false;
			displaycallback(this.mindmapview);
		}.bind(this);
		this.ganttButton.className = "viewBtn";

		this.signout = document.createElement("button");
		this.signout.innerHTML = "Déconnexion";
		this.signout.className = "viewBtn";
		this.signout.onclick = function(){
			signoutcallback();
		}.bind(this);

		/* Boutons du menu à droite */
		this.menuButtons = document.createElement("div");
		this.exportButton = document.createElement("button");
		this.connectionButton = document.createElement("button");
	}

	/**
	 * Rendu graphique du header de la page.
	 */
	render(){
		this.pageHeader.appendChild(this.signout);
		this.viewButtons.appendChild(this.mindMapButton);
		this.viewButtons.appendChild(this.ganttButton);
		this.pageHeader.appendChild(this.viewButtons);

		document.body.appendChild(this.pageHeader);
	}

	/**
	 * Retire le header de la page.
	 */
	remove(){
		this.pageHeader.childNodes.forEach(function(element){
			this.pageHeader.removeChild(element);
		}.bind(this));
		if(this.pageHeader.parentNode == document.body){
			document.body.removeChild(this.pageHeader);
		}
	}
}

