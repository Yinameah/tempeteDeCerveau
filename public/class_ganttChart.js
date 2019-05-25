/**
 * Décrit le diagramme de Gantt.
 */
class ganttChart {
	/**
	 * Instancie les éléments de base du diagramme de Gantt. La création du contenu à proprement parler n'est pas
	 * du ressort du constructeur, mais généré à chaque rendu.
	 * @param {Div element} container conteneur du diagramme
	 */
	constructor(container){
		this.container = container;

		this.division = "days";
		this.timespan = 0;
		this.columnsDates = [];

		this.chart = document.createElement("div");
		this.chart.className = "gantt";
	}

	/**
	 * Crée la première ligne du diagramme de Gantt, qui contient les périodes temporelles, générées dynamiquement
	 * en fonction des données de la mindmap.
	 */
	createChartHeader(){
		/* Le graphique peut être divisé en jours, semaines, mois, années. */
		this.timespan = Math.ceil((this.finaltime.valueOf() - this.initialtime.valueOf())/(1000 * 60 * 60 * 24)) + 1; /* En nombre de jours */
		this.division = "days";
		/* Pour l'instant on pose arbitrairement un maximum de cases dans le graphique (30) */
		if(this.timespan > 900){ /* Si on a plus que 30 mois, on affiche en années */
			this.division = "years";
			this.timespan = this.finaltime.getFullYear() - this.initialtime.getFullYear();
		}
		else if(this.timespan > 210){/* Si on a plus que 30 semaines, on affiche en mois */
			this.division = "months";
			this.timespan = ((this.finaltime.getFullYear() - this.initialtime.getFullYear()) * 12) + 
							(this.finaltime.getMonth() - this.initialtime.getMonth());
		}
		else if(this.timespan > 30){ 
			this.division = "weeks";
			/* Pour chercher le nombre de semaines, on arrondit le nombre de jours en cherchant le lundi précédent et le dimanche suivant.
			On divise ensuite le nombre de jours trouvés par 7. Le nombre doit être rond, même si la vérification n'est pas effectuée. */
			this.timespan =  (this.timespan + ((6 + this.initialtime.getDay()) % 7) + ((7 - this.finaltime.getDay()) % 7))/ 7;
		}

		/* On crée deux éléments: la première ligne du tableau, qui contient les jours/semaines/mois/années, et un élément
		qui se fixe sur chaque colonne et qui permet de mettre en évidence la colonne courante. */
		this.firstline = document.createElement("div");
		this.firstline.className = "gantt__row gantt__row--months";
		this.firstline.innerHTML = "<div class=\"gantt__row-first\"></div>";
		this.colonnes = document.createElement("div");
		this.colonnes.className = "gantt__row gantt__row--lines"
		this.colonnes.innerHTML = "<span></span>";
		
		for(var i=0; i<this.timespan; i++){
			var label = "";
			var marker;
			var today = new Date(Date.now());
			this.columnsDates[i] = new Date(this.initialtime);
			if(this.division == "days"){
				this.columnsDates[i].setDate(this.initialtime.getDate() + i);
				label = this.columnsDates[i].toLocaleDateString('fr-FR',{day: 'numeric', month: 'numeric', year: 'numeric'});
				marker = (today.getDate() == this.columnsDates[i].getDate());
			}
			else if(this.division == "weeks"){
				this.columnsDates[i].setDate(this.initialtime.getDate() - this.initialtime.getDay() + (i*7) + 1);
				label = "Semaine du " + this.columnsDates[i].toLocaleDateString('fr-FR',{day: 'numeric', month: 'numeric', year: 'numeric'});
				marker = ((today.getDate() - this.columnsDates[i].getDay()) == (this.columnsDates[i].getDate() - this.columnsDates[i].getDay()));
			}
			else if(this.division == "months"){
				this.columnsDates[i].setMonth(this.initialtime.getMonth() + i);
				label = this.columnsDates[i].toLocaleDateString('fr-FR',{month: 'numeric', year: 'numeric'});
				marker = (today.getMonth() == this.columnsDates[i].getMonth());
			}
			else if(this.division == "years"){
				this.columnsDates[i].setYear(this.initialtime.getYear() + i);
				label = this.columnsDates[i].toLocaleDateString('fr-FR',{year: 'numeric'});
				marker = (today.getYear() == this.columnsDates[i].getYear());
			}
			this.firstline.innerHTML += "<span>" + label + "</span>";

			if(marker){
				this.colonnes.innerHTML += "<span class=\"marker\"></span>";
			}
			else{
				this.colonnes.innerHTML += "<span></span>";
			}
		}
		this.chart.appendChild(this.firstline);
		this.chart.appendChild(this.colonnes);
	}

	/**
	 * Détermine les dates limites du tableau, en fonction des noeuds à y représenter.
	 * @param {Nodes collection} nodes données de la mindmap
	 */
	findLimitDates(nodes){
		var initialTime = new Date(0xFFFFFFFFFFF);
		var finalTime = new Date(0);
		nodes.forEach(function(node){
			if((node.starttime != null) && (node.endtime != null)){
				if(node.starttime.valueOf() < initialTime.valueOf()){
					initialTime = node.starttime;
				}
				if(node.endtime.valueOf() > finalTime.valueOf()){
					finalTime = node.endtime;
				}
			}
		});

		if(initialTime.valueOf() > finalTime.valueOf()){ /* Permet de détecter si au moins une date de début et de fin ont été trouvées */
			initialTime = null;
			finalTime = null;
		};

		return [initialTime, finalTime];
	}

	/**
	 * Détermine la colonne corresponda à la date donnée en parmaètres.
	 * @param {Date} date 
	 */
	getColumnFromDate(date){
		for(var i = this.timespan - 1; i >= 0; i--){
			if(date.valueOf() >= this.columnsDates[i].valueOf()){
				return i + 1;
			}
		}
	}

	/**
	 * Crée une ligne sur la base des données d'un noeud.
	 * @param {Node} node noeud à ajouter
	 */
	addRow(node){
		var row = document.createElement("div");
		
		if((node.starttime == null) || (node.endtime == null)){
			row.className = ("gantt__row gantt__row--empty");
			var rowfirst = document.createElement("div");
			rowfirst.className = "gantt__row-first";
			rowfirst.innerHTML = node.content;
			var rowbar = document.createElement("ul");
			rowbar.className = "gantt__row-bars";

			row.appendChild(rowfirst);
			row.appendChild(rowbar);
		}
		else{
			/* On cherche la case de début et la case de fin */
			var case1 = this.getColumnFromDate(node.starttime);
			var case2 = this.getColumnFromDate(node.endtime) + 1;
			row.className = "gantt__row";
			var rowfirst = document.createElement("div");
			rowfirst.className = "gantt__row-first";
			rowfirst.innerHTML = node.content;
			var rowbar = document.createElement("ul");
			rowbar.className = "gantt__row-bars";
			rowbar.innerHTML = "<li style=\" grid-column: " + String(case1) + "/" + String(case2) + 
								"; background-color: #2ecaac;\">" + node.content + "</li>";
			row.appendChild(rowfirst);
			row.appendChild(rowbar);
		}

		this.chart.appendChild(row);
	}


	/**
	 * Les noeuds sont ajoutés dans le diagramme par ordre de dépendance. Pour ce faire, on utilise une récursion,
	 * permettant de faire suivre chaque noeud parent par ses noeuds enfants.
	 * @param {Map} nodes noeuds de la mindmap
	 * @param {String} root identifiant du noeud de base. 
	 */
	addChildrenRecursif(nodes, root){
		nodes.forEach(function(node){
			if((node.nodeId != node.parentNode) && (node.parentNode == root)){
				this.addRow(node);
				this.addChildrenRecursif(nodes, node.nodeId);
			}
		}.bind(this));
	}
	

	/**
	 * Lance le rendu du diagramme de Gantt. Le noeud est intégralement généré à chaque rendu, ce qui permet de prendre
	 * en compte les récents changements de la mindmap.
	 * @param {Map} nodes noeuds de la mindmap
	 */
	render(nodes){
		this.remove();			
		
		this.container.appendChild(this.chart);

		[this.initialtime, this.finaltime] = this.findLimitDates(nodes);
		
		if((this.initialtime != null) && (this.finaltime != null)){
			this.createChartHeader();

			/* étape 1: trouver les racines */
			var roots = [];
			nodes.forEach(function(node){
				if(node.parentNode == 0){
					roots.push(node.nodeId);
				}
			}.bind(this));

			/* étape 2: afficher toutes les sous-branches, de manière récursive */
			roots.forEach(function(root){
				this.addRow(nodes.get(root));
				this.addChildrenRecursif(nodes, root);
			}.bind(this));
		}
		else{
			/* TODO afficher un message pour dire qu'il n'y a rien à afficher */
		}
	}

	/**
	 * Retire le diagramme de Gantt de la page.
	 */
	remove(){
		if(this.chart !== undefined){
			if(this.chart.parentNode == this.container){
				this.chart.childNodes.forEach(function(element){
					this.chart.removeChild(element);
				}.bind(this));
				this.container.removeChild(this.chart);
			}
		}
	}
}