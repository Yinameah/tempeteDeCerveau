/**
 * Classe qui encapsule toutes les liaisons avec la base de donnée Firestore.
 */
class mindMapDatabase {
	/**
	 * Constructeur qui initialise la base de données firestore.
	 */
	constructor(){
		this.db = firebase.firestore();
		this.projectRef = "";
	}

	/**
	 * Récupère l'identifiant du dernier noeud ajouté (stocké à part dans la db), l'incrémente et renvoie le résultat.
	 */
	getNewNodeId(){
		/* Référence vers le document contenant le lastId */
		var lastIdRef = this.db.collection("Divers").doc("lastId");

		return this.db.runTransaction(function(transaction) {
			return transaction.get(lastIdRef).then(function(doc) {
				if (!doc.exists) {
					console.log("Impossible de trouver la référence dans a base de données, dans getNewNodeId");
				}
				var newId = doc.data().lastId + 1;
				transaction.update(lastIdRef, { lastId: newId });
				return newId;
			});
		});
	}

	/**
	 * Crée une référence au document contenant les données du projet passé en paramètres. Cette référence sera 
	 * utilisée pour les requêtes suivantes sur la base de données.
	 * @param {String} project nom du projet
	 */
	linkProject(projectRef){
		this.projectRef = projectRef;
	}

	/**
	 * Récupère la liste des projets auxquels participe l'utilisateur.
	 * @param {String} userEmail adresse mail de l'utilisateur
	 */
	getProjectsList(user){
		return this.db.collection("Users").where("userID", "==", user.uid).get()
			.then(
				function(querySnapshot){
					if(querySnapshot.empty){
						return null; /* Pour indiquer qu'il n'y a aucun projet défini */
					}
					else{
						var result = querySnapshot.docs[0].data();
						/* return result['Projets']; */
						return result['ProjectsRefs'];
					}
				}.bind(this))
			.catch(function(error) {
					console.log("Erreur dans la récupération des projets: ", error);
				});
	}


	/**
	 * Ajoute un noeud dans la base de données.
	 * @param {objet: node} node noeud à rajouter (structure complète)
	 */
	addNode(node){
		this.setDocument("Nodes",String(node.nodeId),{
			id: node.nodeId,
			level: node.level,
			parentnode: node.parentNode,
			content: node.content,
			x: node.x,
			y: node.y,
			starttime: node.starttime,
			endtime: node.endtime,
			type: node.type,
			priority: node.priority,
			users: node.users,
			status: node.status,
			link: node.link,
			archive: node.archive
		});
	}


	/**
	 * Supprime un noeud de la base de données.
	 * @param {number} nodeId identifiant du noeud à supprimer.
	 */
	deleteNode(nodeId){
		this.deleteDocument("Nodes", String(nodeId));
	}


	/**
	 * Modifie le contenu d'un noeud.
	 * @param {number} nodeId identifiant du noeud à modifier
	 * @param {string} content nouveau contenu.
	 */
	setNodeContent(nodeId, content){
		this.updateDocument("Nodes", String(nodeId), {content: content});
	}


	/**
	 * Modifie la position du noeud
	 * @param {*} nodeId identifiant du noeud à modifier
	 * @param {*} newx nouvelle position du noeud - x
	 * @param {*} newy nouvelle position du noeud - y
	 */
	setNodePosition(nodeId, newx, newy){
		this.updateDocument("Nodes", String(nodeId), {x: newx, y: newy});
	}

	
	/**
	 * Enregistre les paramètres d'un noeud.
	 * @param {Number} nodeId identifiant du noeud
	 * @param {String} newtype 
	 * @param {String} newpriority 
	 * @param {String[]} newusers 
	 * @param {String} newstatus 
	 * @param {Date} newstarttime 
	 * @param {Date} newendtime 
	 * @param {Boolean} newarchive propriété pas encore utilisée, qui permettra une fois implémentée d'archiver des noeuds.
	 */
	setNodeSettings(nodeId,newtype,newpriority,newusers,newstatus, newstarttime, newendtime, newarchive){
		this.updateDocument("Nodes", String(nodeId), {type: newtype, priority: newpriority, users: newusers,
							 status: newstatus, starttime: newstarttime, endtime: newendtime, archive: newarchive});
	}


	/**
	 * La fonction crée une requête de lecture continue sur une collection. Tous les changements sont renvoyés à la fonction
	 * de callback fournie. Lorsque le listener est créé, tous les éléments de la base de donnée sont signalés comme des éléments
	 * nouvellement créés.
	 * @param {String} collection collection que l'on veut écouter.
	 * @param {function} callback Fonction de callback appelée lorsqu'il y a des changements
	 */
	createCollectionListener(collection,callback){
		return this.projectRef.collection(collection).orderBy("level").onSnapshot(function(snapshot){
			if(!snapshot.metadata.hasPendingWrites){
				callback(snapshot.docChanges());
			}
		});
	}


	/**
	 * Inscrit un document dans une collection de la base de données
	 * @param {string} collection collection dans laquelle on veut inscrire le document
	 * @param {string} docName nom du document (nouveau)
	 * @param {objet} data données à inscrire.
	 */
	setDocument(collection, docName, data){
		this.projectRef.collection(collection).doc(docName).set(data).catch(function(error) {
			console.error("Erreur dans la modification/l'ajout du document.", error);
		});
	}

	/**
	 * Modifie des données dans un document d'une collection
	 * @param {string} collection collection dans laquelle se trouve le document à modifier
	 * @param {string} docName nom du document à modifier
	 * @param {objet} data données à inscrire.
	 */
	updateDocument(collection,docName,data){
		this.projectRef.collection(collection).doc(docName).update(data).catch(function(error) {
			console.error("Erreur dans la modification/l'ajout du document.", error);
		});
	}

	/**
	 * Supprime un document dans une collection
	 * @param {string} collection collection dans laquelle se trouve le document
	 * @param {string} docName document à supprimer
	 */
	deleteDocument(collection,docName){
		this.projectRef.collection(collection).doc(docName).delete().then(function() {
			console.log("Document supprimé");
		}).catch(function(error) {
			console.error("Erreur à la suppression du document: ", error);
		});
	}
}