/**
 * Classe de base du programme. Instancie les différents éléments et gère les connexions et déconnexions.
 */
class tempeteDeCerveau {
    /**
     * Le constructeur de la classe tempeteDeCerveau instancie les outils d'authentification, la base de données,
     * le sélecteur de projet et la classe contenant la mindmap.
     */
    constructor(){
        this.authentificateur = new authentification(this.onConnection.bind(this), this.onDisconnection.bind(this), 1);
        this.database = new mindMapDatabase();
        this.projectSelector = new projectSelector(this.onProjectSelection.bind(this), this.database);
        this.mindmap = new mindMap(this.database, this.authentificateur);

        this.titlediv = document.createElement("div");
        this.titlediv.className = "titlediv";
        this.titlediv.innerHTML = "<h2>Tempête de cerveau</h2><br>";
        //<div id="firebaseui-auth-container"></div>
        this.logindiv = document.createElement("div");
        //this.logindiv.innerHTML = "<h3>Connexion avec Google</h3>";
        //this.logindiv.className = "logindiv";
        this.logindiv.id = "firebaseui-auth-container";
        //this.logindiv.onclick = this.authentificateur.connect.bind(this.authentificateur);
        //this.logindiv.style.cursor = "pointer";
    }

    /**
     * Callback appelée lorsque l'utilisateur se connecte. Désactive l'invite de connexion et affiche le sélecteur de projet.
     * @param {Structure} user structure fournie par l'outil d'authentification de google.
     */
    onConnection(user){
        this.remove();
        this.projectSelector.render(user);
    }

    /**
     * Callback appelée lorsque l'utilisateur se déconnecte. Vide complètement l'application et affiche l'invite de connexion.
     */
    onDisconnection(){
        console.log(this.mindmap);
        if(this.mindmap != null){
            this.mindmap.remove();
        }
        this.projectSelector.remove();
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
        document.body.appendChild(this.titlediv);
        document.body.appendChild(this.logindiv);
        this.authentificateur.connect().bind(this.authentificateur);
    }
    
    /**
     * Retire l'invite de connexion.
     */
    remove(){
        if(this.titlediv.parentNode == document.body){
            document.body.removeChild(this.titlediv);
        }
        if(this.logindiv.parentNode == document.body){
            document.body.removeChild(this.logindiv);
        }
    }
}