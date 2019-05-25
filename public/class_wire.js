/**
 * Cette classe représente une liaison entre deux noeuds. Elle contient les fonctions mathématiques pour calculer sa
 * trajectoire ainsi que les outils de rendu graphique.
 */
class wire {
	/**
	 * Constructeur de la classe wire. Spécifie les points de départ et d'arrivée de la courbe, ainsi qu'un
	 * identifiant utilisé pour différencier les courbes dans le code HTML. elle crée aussi le bloc dans lequel 
	 * on va dessiner la courbe.
	 * @param parentDiv objet graphique contenant l'élément.
	 * @param {number} originX 		Point d'origine - coordonnée x
	 * @param {number} originY 		Point d'origine - coordonnée y
	 * @param {number} destinationX Point de destination - coordonnée x
	 * @param {number} destinationY Point de destination - coordonnée y
	 * @param {number} id 			Identifiant de la courbe (même identifiant que le noeud de rang inférieur auquel
	 * 								la liaison est rattachée.)
	 */
	constructor(parentDiv, originX, originY, destinationX, destinationY,id){
		this.parentDiv = parentDiv;
		this.id = id;
		this.originX = originX;
		this.originY = originY;
		this.destinationX = destinationX;
		this.destinationY = destinationY;
		this.curve = document.createElement("div");

		this.parentDiv.appendChild(this.curve);
	}

	/**
	 * Setter des coordonnées du point de destination.
	 * @param {number} destinationX 
	 * @param {number} destinationY 
	 */
	setDestination(destinationX, destinationY){
		this.destinationX = destinationX;
		this.destinationY = destinationY;
	}

	/**
	 * Setter des coordonnées du point d'origine.
	 * @param {number} originX 
	 * @param {number} originY 
	 */
	setOrigin(originX, originY){
		this.originX = originX;
		this.originY = originY;
	}

	/**
	 * Permet de calculer la position et la taille du bloc contenant la courbe en fonction des points
	 * d'origine et d'arrivée.
	 */
	calcDimensions(){
		this.height = Math.abs(this.destinationY - this.originY);
		this.up = (this.originY > this.destinationY);
		this.right = (this.originX < this.destinationX);
		this.width = Math.abs(this.destinationX - this.originX);
		if(this.up){
			this.y = this.destinationY;
			this.starty = this.height;
			this.stopy = 0;
		}
		else{
			this.y = this.originY;
			this.starty = 0;
			this.stopy = this.height;
		}
		if(this.right){
			this.x = this.originX;
			this.startx = 0;
			this.stopx = this.width;
		}
		else{
			this.x = this.destinationX;
			this.startx = this.width;
			this.stopx = 0
		}
	}

	/**
	 * Suppression de la liaison.
	 */
	delete(){
		this.parentDiv.removeChild(this.curve);
	}
	
	/**
	 * Rendu graphique de la liaison.
	 */
	render(){
		this.calcDimensions();
		this.curve.setAttribute('class', "wire");
		this.curve.setAttribute('Style', "left:" + String(this.x) + "px;top:" + String(this.y) + "px");
		this.curve.innerHTML = "<canvas width="+ String(this.width) + " height=" + String(this.height) +
				 " id=\"canvas" + String(this.id) + "\">Votre navigateur ne supporte psa les canvas.</canvas>";
		
		var canvas = document.getElementById("canvas" + String(this.id));
		var context = canvas.getContext("2d");
		context.beginPath();
		context.moveTo(this.startx, this.starty);
		context.quadraticCurveTo(this.startx, this.stopy, this.stopx, this.stopy);
		context.stroke(); 
	}
	
}