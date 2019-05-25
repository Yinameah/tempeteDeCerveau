/**
 * Le panneau de paramétrage est un unique objet qui apparait lorsqu'un élément est sélectionné. A chaque apparition, son contenu
 * est modifié en fonctio du noeud sélectionné.
 */
class settingsPanel{
    /**
     * Création du panneau latéral de paramétrisation.
     * @param {function} callback fonction de callback appelée lors d'une modification.
     */
    constructor(callback){

        this.users = [];
        this.type = 0;
        this.status = 0;
        this.priority = 0;
        this.starttime = new Date(0);
        this.endtime = new Date(0);
        this.timingEnabled = (this.endtime.valueOf() == this.starttime.valueOf());
        this.callback = callback;

        /* Création de l'objet graphique */
        this.createPanel();
    }

    /**
     * Permet de créer le type énuméré TYPES().
     */
    get TYPES() {
        return Object.freeze({
            TOPIC: 0,
            SUBJECT: 1,
            IDEA: 2,
            TASK: 3,
            COMMENT: 4
        });
    }

    /**
     * Permet de créer le type énuméré PRIORITY().
     */
    get PRIORITY(){
        return Object.freeze({
            NO_PRIORITY: 0,
            LOW: 1,
            MEDIUM: 2,
            HIGH: 3
        });
    }

    /**
     * Permet de créer le type énuméré STATUS().
     */
    get STATUS(){
        return Object.freeze({
            ACTIVE: 0,
            DONE: 1,
            DISMISSED: 2
        });
    }

    /**
     * Fonction appelée à chaque fois qu'une modification est effectuée sur les paramètres du panneau, pour reporter ces changements
     * au niveau du noeud en invoquant la fonction de callback fournie par la classe mindmap.
     */
    changeSetting(){
        /* Mise à jour des paramètres */
        this.type = this.getRadioButtonValue("type");
        this.priority = this.getRadioButtonValue("priority");
        this.starttime = this.starttimefield.valueAsDate;
        this.endtime = this.endtimefield.valueAsDate;

        /* Callback pour le nouveau rendu du noeud */
        if(this.callback != null){
            this.callback();
        }
    }
    
    /**
     * Création des éléments graphiques du panneau.
     */
    createPanel(){ 
        this.panel = document.createElement("div");
        this.panel.setAttribute("class", "settingPanel");
        /* Titre du Div */
        this.paneltitle = document.createElement("span");
        this.paneltitle.innerHTML = "Configuration de la bulle:\n";
        this.paneltitle.className = "settingsTitle";

        /* Création des boutons radio pour le type */
        this.typetitle = document.createElement("span");
        this.typetitle.className = "settingsSubtitle";
        this.typetitle.innerHTML = "Type de bulle:\n";
        this.typeForm = document.createElement("div");
        this.typeForm.appendChild(this.typetitle);
        this.addRadio(this.typeForm,"type", "Thème", "rbtopic",this.TYPES['TOPIC'], (this.TYPES['TOPIC'] == this.type));
        this.addRadio(this.typeForm,"type", "Sujet", "rbsubject", this.TYPES['SUBJECT'], (this.TYPES['SUBJECT'] == this.type));
        this.addRadio(this.typeForm,"type", "Idée", "rbidea", this.TYPES['IDEA'], (this.TYPES['IDEA'] == this.type));
        this.addRadio(this.typeForm,"type", "Tâche", "rbtask", this.TYPES['TASK'], (this.TYPES['TASK'] == this.type));
        this.addRadio(this.typeForm,"type", "Commentaire", "rbcomment", this.TYPES['COMMENT'], (this.TYPES['COMMENT'] == this.type));
        

        /* Boutons radio pour la priorité */
        this.priorityForm = document.createElement("div");
        this.prioritytitle = document.createElement("span");
        this.prioritytitle.className = "settingsSubtitle";
        this.prioritytitle.innerHTML = "Priorité:";
        this.priorityForm.appendChild(this.prioritytitle);
        this.addRadio(this.priorityForm,"priority", "Haute", "rbhigh", this.PRIORITY['HIGH'], (this.PRIORITY['HIGH'] == this.priority));
        this.addRadio(this.priorityForm,"priority", "Moyenne", "rbmedium", this.PRIORITY['MEDIUM'], (this.PRIORITY['MEDIUM'] == this.priority));
        this.addRadio(this.priorityForm,"priority", "Basse", "rblow", this.PRIORITY['LOW'], (this.PRIORITY['LOW'] == this.priority));
        this.addRadio(this.priorityForm,"priority", "Aucune priorité", "rbnopriority", this.PRIORITY['NO_PRIORITY'], 
                        (this.PRIORITY['NO_PRIORITY'] == this.priority));


        /* Boutons pour le statut */
        this.statusButtons = document.createElement("div");
        this.statusButtons.className = "btnContainer";
        this.checkbutton = document.createElement("button");
        this.checkbutton.className = "btn";
        this.checkbutton.innerHTML = "Terminé";
        this.checkbutton.onclick = this.nodechecked.bind(this);
        this.statusButtons.appendChild(this.checkbutton);

        this.dismissedbutton = document.createElement("button");
        this.dismissedbutton.className = "btn";
        this.dismissedbutton.innerHTML = "Abandonné";
        this.dismissedbutton.onclick = this.dismissnode.bind(this);
        this.statusButtons.appendChild(this.dismissedbutton);

        /* Date de début et de fin */
        this.dateForm = document.createElement("div");
        this.addDateField(this.dateForm,"starttime","Date de démarrage","starttime",this.starttime);
        this.addDateField(this.dateForm,"endtime","Date d'échéance","endtime",this.endtime);

        /* checkboxes pour les utilisateurs - pas implémenté */
        this.usersForm = document.createElement("div");
        this.addCheckbox(this.usersForm,"username", "username", "username", false);     

        /* Fonction de callback lorsqu'on clique sur le paneau, pour éviter une déselction. */
        this.panel.onmousedown = function(event){
            event.stopPropagation();
        };
        this.panel.ondblclick = function(event){
            event.stopPropagation();
        };

        /* Ajout de tous les éléments au paneau */
        this.panel.style.display = "none";
        this.panel.appendChild(this.paneltitle);
        this.panel.appendChild(this.typeForm);
        this.panel.appendChild(this.priorityForm);
        this.panel.appendChild(this.statusButtons);
        this.panel.appendChild(this.dateForm);

        
    }

    /**
     * Fonction de callback invoquer lorsqu'on clique sur le bouton "Terminé"
     */
    nodechecked(){
        if(this.status == this.STATUS["DONE"]){
            this.status = this.STATUS["ACTIVE"];
        }
        else{
            this.status = this.STATUS["DONE"];
        }

        /* Callback pour le nouveau rendu du noeud */
        if(this.callback != null){
            this.callback();
        }

        this.render();
    }

    /**
     * Fonction de callback invoquer lorsqu'on clique sur le bouton "Abandonné"
     */
    dismissnode(){
        if(this.status == this.STATUS["DISMISSED"]){
            this.status = this.STATUS["ACTIVE"];
        }
        else{
            this.status = this.STATUS["DISMISSED"];
        }

        /* Callback pour le nouveau rendu du noeud */
        if(this.callback != null){
            this.callback();
        }

        this.render();
    }

    /**
     * Permet d'ajouter un bouton radio au panneau.
     * @param {HTMLDivElement} parent Div qui doit contenir le bouton radio
     * @param {String} name Nom du bouton
     * @param {String} label Texte affich à côté du bouton
     * @param {String} id Identifiant du bouton
     * @param {Number} value Valeur liée au bouton
     * @param {Boolean} checked état initial du bouton
     */
    addRadio(parent,name,label,id,value,checked){
        var newlabel = document.createElement("label");
        newlabel.className = "radioButtonContainer";
        var checkedstring = "";
        if(checked == true){
            checkedstring = " checked=\"checked\"";
        }
        newlabel.innerHTML = label + "<input type=\"radio\" id=" + id + " name=" + name + checkedstring +
        " value=" + value + "><span class=\"radioButtonImage\"></span>";
        newlabel.onclick = this.changeSetting.bind(this);
        parent.appendChild(newlabel);
    }

    /**
     * Getter de la valeur de set de boutons possédant le nom "name"
     * @param {String} name nom de la série de boutons radio dont on veut connaître la valeur
     */
    getRadioButtonValue(name){
        var buttons = document.getElementsByName(name);
        for(var i = 0; i < buttons.length; i++){
            if(buttons[i].checked){
                return buttons[i].value;
            }
        }
    }

    /**
     * Force une valeur sur un set de bouton radio.
     * @param {String} name Nom du set de boutons dont on veut fixer la valeur
     * @param {Number} value Valeur à fixer
     */
    setRadioButtonValue(name,value){
        var buttons = document.getElementsByName(name);
        for(var i = 0; i < buttons.length; i++){
            if(buttons[i].value == value){
                buttons[i].checked = true;
            }
            else{
                buttons[i].checked = false;
            }
        }
    }

    /**
     * Création d'un champ "date"
     * @param {HTMLDivElement} parent Div qui doit contenir le champ
     * @param {String} name nom du champ
     * @param {String} label Texte devant apparaître à côté du champ
     * @param {String} id Identifiant du champ
     */
    addDateField(parent,name,label,id){
        var newlabel = document.createElement("label");
        newlabel.className = "dateInputContainer";
        newlabel.innerHTML = "<span width=\"60%\">" + label + ":</span><input type=\"date\" id=\"" 
                            + id + "\" name=" + name + ">";

        parent.appendChild(newlabel);
    }

    /**
     * Fixe la valeur des champs "date de démarrage" et "date d'échéance"
     * @param {Date} starttime date de démarrage
     * @param {Date} endtime date d'échéance
     */
    setDatesValues(starttime,endtime){
        this.starttimefield.valueAsDate = starttime;
        this.endtimefield.valueAsDate = endtime;
    }

    /**
     * Ajout d'une checkbox
     * @param {HTMLDivElement} parent Div qui doit contenir la checkbox
     * @param {String} name 
     * @param {String} label 
     * @param {String} id 
     * @param {Boolean} checked 
     */
    addCheckbox(parent,name,label,id,checked){
        var newlabel = document.createElement("label");
        newlabel.className = "checkboxContainer";
        var checkedstring = "";
        if(checked == true){
            checkedstring = " checked=\"checked\"";
        }
        newlabel.innerHTML = label + "<input type=\"checkbox\" id=" + id + " name=" + name + checkedstring + " >\
        <span class=\"checkboxImage\"></span>";
        parent.appendChild(newlabel);
    }

    /**
     * Fonction appelée lors de la sélection d'un noeud. Met à jour les champs du panneau et le rend visible.
     * @param {Node} currentNode Contenu du noeud sélectionné
     */
    showPanel(currentNode){
        this.type = currentNode.type;
        this.priority = currentNode.priority;
        this.status = currentNode.status;
        this.users = currentNode.users;
        this.starttime = currentNode.starttime;
        this.endtime = currentNode.endtime;
        this.render();
    }

    /**
     * Cache le panneau (lorsqu'un noeud est désélectionné)
     */
    hidePanel(){
        this.panel.style.display = "none";
    }

    /**
     * Rendu du panneau.
     */
    render(){
        var self = this;

        document.body.appendChild(this.panel);

        /* l'élément <input> ne peut pas être ajouté avec appendChild(). On doit donc d'abord l'ajouter,
        pius le récupérer avec getElmentById. */
        this.starttimefield = document.getElementById("starttime");
        this.endtimefield = document.getElementById("endtime");
        this.starttimefield.onchange = this.changeSetting.bind(this);
        this.endtimefield.onchange = this.changeSetting.bind(this);
        this.setDatesValues(this.starttime, this.endtime);

        document.getElementsByName("type").forEach(function(rbutton){
            if(rbutton.value == self.priority){
                rbutton.checked = true;
            }
            else{
                rbutton.checked = false;
            }
        });
        document.getElementsByName("priority").forEach(function(rbutton){
            if(rbutton.value == self.priority){
                rbutton.checked = true;
            }
            else{
                rbutton.checked = false;
            }
        });
        this.setRadioButtonValue("type",this.type);
        this.setRadioButtonValue("priority",this.priority);
        if(this.status == this.STATUS["DONE"]){
            this.checkbutton.className = "btn btnselected";
        }
        else{
            this.checkbutton.className = "btn";
        }
        if(this.status == this.STATUS["DISMISSED"]){
            this.dismissedbutton.className = "btn btnselected";
        }
        else{
            this.dismissedbutton.className = "btn";
        }

        this.starttimefield.valueAsDate = this.starttime;
        this.endtimefield.valueAsDate = this.endtime;

        this.panel.style.display = "block";
    }

    /**
     * Retire le panneau de la page.
     */
    remove(){
        /* Les éléments du panneau restent présents, mais le panneau est retiré du document */
        if(this.panel.parentNode == document.body){
            document.body.removeChild(this.panel);
        }
    }
}