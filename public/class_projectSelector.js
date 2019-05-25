/**
 * Décrit les éléments graphiques et les fonctions pour la sélection du projet.
 */
class projectSelector {
    /**
     * 
     * @param {Function} onSelect callback à effectuer lors de la sélection d'un projet
     * @param {Object} database lien vers l'objet base de données.
     */
    constructor(onSelect, database){
        this.database = database;
        this.onSelect = onSelect;
        this.projectList = [];
    }

    /**
     * Génère le contenu du sélecteur de projet. Fait une recherche dans la base de données pour déterminer
     * les projets appartenant à l'utilisateur indiqué en paramètre.
     * @param {Object} user structure de l'utilisateur, fournie par l'outil d'authentification de google.
     */
    createContent(user){
        this.choiceDiv = document.createElement("div");
        this.choiceDiv.innerHTML = "<h3>Choix du projet</h3><br><br>";
        this.choiceDiv.className = "titlediv";
        this.projectsDivs = [];

        return this.database.getProjectsList(user).then(function(projects){
            projects.forEach(function(element){
                this.projectList.push(element);
                var div = document.createElement("div");
                div.innerHTML = "<span>" + element + "</span><br>";
                div.className = "caseprojet";
                div.onclick = function(){
                    this.onSelect(element);
                }.bind(this);
                this.projectsDivs.push(div);
            }.bind(this));
        }.bind(this));
    }

    /**
     * Effectue le rendu graphique du sélecteur de projet, ainsi que la mise à jour de son contenu en fonction
     * de l'utilisateur connecté.
     * @param {Object} user structure de l'utilisateur, fournie par l'outil d'authentification de google.
     */
    render(user){
        this.createContent(user).then(function(){
            this.projectsDivs.forEach(function(element){
                this.choiceDiv.appendChild(element);
            }.bind(this));
            document.body.appendChild(this.choiceDiv);
        }.bind(this));
    }

    /**
     * Retire de la page les éléments du sélecteur de projet.
     */
    remove(){
        if(this.projectDivs !== undefined){
            this.projectsDivs.forEach(function(element){
                this.choiceDiv.removeChild(element);
            }.bind(this));
        }
        if(this.choiceDiv != null){
            if(this.choiceDiv.parentNode == document.body){
                document.body.removeChild(this.choiceDiv);
            }
        }
    }
}