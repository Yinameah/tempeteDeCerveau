/**
 * La classe authentification gère les connexions et déconnexions de l'utilisateur.
 */
class authentification {
    /**
     * Instancie les éléments permettant une connexion.
     * @param {function} onConnect callback appelée lors de la connexion
     * @param {function} onDisconnect callback appelée lors de la déconnexion
     * @param {Number}  mode mode de connexion: 0: google, autre: email/password.
     */
    constructor(onConnect, onDisconnect){
        this.provider = new firebase.auth.GoogleAuthProvider();
        this.mode = 1;

        this.onConnect = onConnect;
        this.onDisconnect = onDisconnect;

        this.user = null;

        /* Mise en place de la fonction de callback qui est activée à chaque changement d'état de connexion. */
        firebase.auth().onAuthStateChanged(function (authUser) {
            if(authUser){
                this.user = authUser;
                onConnect(authUser);
            }
            else{
                console.log("signed out");
                onDisconnect();
                this.user = null;
            }
        });
    }

    /**
     * Lance le popup de connexion.
     */
    connect(){
        if(this.mode == 0){
            firebase.auth().signInWithPopup(this.provider).then(function(result) {
                this.user = result.user;
                firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
            }.bind(this)).catch(function(error) {
                var errorMessage = error.message;
                console.log(errorMessage);
            });
        }
        else{
            var ui = new firebaseui.auth.AuthUI(firebase.auth());

            var uiConfig = {
                callbacks: {
                  signInSuccessWithAuthResult: function(authResult, redirectUrl) {
                    // User successfully signed in.
                    // Return type determines whether we continue the redirect automatically
                    // or whether we leave that to developer to handle.
                    return false;
                  },
                  uiShown: function() {
                    // The widget is rendered.
                    // Hide the loader.
                    document.getElementById('loader').style.display = 'none';
                  }
                },
                // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
                signInFlow: 'popup',
                signInSuccessUrl: '',
                signInOptions: [
                  // Leave the lines as is for the providers you want to offer your users.
                  firebase.auth.EmailAuthProvider.PROVIDER_ID
                ],
                // Terms of service url.
                //tosUrl: './',
                // Privacy policy url.
                //privacyPolicyUrl: './'
              };

              ui.start('#firebaseui-auth-container', uiConfig);
        }
    }

    /** 
     * déconnecte l'utilisateur
     */
    disconnect(){
        this.onDisconnect();
        firebase.auth().signOut().then(function(){
            this.user = null;
        }.bind(this));
    }

}