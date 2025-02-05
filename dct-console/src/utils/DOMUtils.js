export default class DOMUtils{
    static setClickEvent(id, callback){
        document.getElementById(id).onclick=callback;
    }

    static setInnerHTML(id, html){
        document.getElementById(id).innerHTML=html;
    }

    static disableInput(id){
        document.getElementById(id).disabled=true;
    }
    
    static enableInput(id){
        document.getElementById(id).disabled=false;
    }

    static show(id){
        document.getElementById(id).style.display="flex";
    }
    
    static hide(id){
        document.getElementById(id).style.display="none";
    }
}