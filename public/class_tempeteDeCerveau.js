/**
 * Classe de base du programme. Instancie les différents éléments et gère les connexions et déconnexions.
 */
class tempeteDeCerveau {
    /**
     * Le constructeur de la classe tempeteDeCerveau instancie les outils d'authentification, la base de données,
     * le sélecteur de projet et la classe contenant la mindmap.
     */
    constructor(){
        this.titlediv = document.createElement("div");
        this.titlediv.className = "titlediv";
        this.titlediv.innerHTML = "<h2>Tempête de cerveau</h2><br>";
        this.logindiv = document.createElement("div");
        this.logindiv.id = "firebaseui-auth-container";
        this.loadingdiv = document.createElement("div");
        this.loadingdiv.id = "loader";

        document.body.appendChild(this.titlediv);
        document.body.appendChild(this.logindiv);
        document.body.appendChild(this.loadingdiv); /* On a besoin de ce trois DIV dans la construction de l'authentificateur. */

        this.authentificateur = new authentification(this.onConnection.bind(this), this.onDisconnection.bind(this));
        this.database = new mindMapDatabase();
        this.projectSelector = new projectSelector(this.onProjectSelection.bind(this), this.database);
        this.mindmap = new mindMap(this.database, this.authentificateur);
    }


    start(){
        this.render();
        this.authentificateur.connect();
    }

    /**
     * Callback appelée lorsque l'utilisateur se connecte. Désactive l'invite de connexion et affiche le sélecteur de projet.
     * @param {Structure} user structure fournie par l'outil d'authentification de google.
     */
    onConnection(user){
        console.log("On connection");
        this.remove();
        this.projectSelector.render(user);
    }

    /**
     * Callback appelée lorsque l'utilisateur se déconnecte. Vide complètement l'application et affiche l'invite de connexion.
     */
    onDisconnection(){
        console.log("On disconnection");
        this.projectSelector.remove();
        if(this.mindmap != null){
            this.mindmap.remove();
        }
        this.render();
    }

    /**
     * Callback appelée lorsqu'un projet est sélectionné. Actionne le rendu du projet sélectionné.
     * @param {String} project nom du projet à afficher
     */
    onProjectSelection(project){
        if(this.mindmap != null){
            this.mindmap.remove();
        }
        this.projectSelector.remove();
        this.mindmap.render(project);
    }

    /**
     * Affiche l'invite de connexion.
     */
    render(){
        //this.logindiv.style.display = "block";
        this.titlediv.style.display = "block";
        //this.loadingdiv.style.display = "block";
    }
    
    /**
     * Retire l'invite de connexion.
     */
    remove(){
        //this.logindiv.style.display = "none";
        this.titlediv.style.display = "none";
        //this.loadingdiv.style.display = "none";
    }
}