// extrafunc if tab is switched
var tabfunc={};
var activeTab="";

function addTabEv() {
    alltablinks = document.getElementsByClassName("tablinks");
    console.log("add tab events " + alltablinks.length);
    for (var i = 0; i < alltablinks.length; i++) {
        var tabid = alltablinks[i].getAttribute("tabid");
        console.log("tablink " + tabid);
        alltablinks[i].addEventListener("click", openTab, false);
    }

}
//-----------------------------------------------------------------------------
function openTab(evt,tabid) {
var curTab ="";
if (evt==="no") {
	      curTab =tabid;  
	        }
	else {
		//element that triggered event
    curTab = evt.target.getAttribute("tabid");
    var b=false;	
   if (!curTab) { // currentTarget to get element the event is attached to (element that has the event listener)
	          curTab=evt.currentTarget.getAttribute("tabid");
	          b=true;
	        }
	}
	activeTab=curTab;
    // Declare all variables
    var i, tabcontent, tablinks;

   tactile();
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    if (tabfunc[curTab]) tabfunc[curTab]();
    document.getElementById(curTab).style.display = "block";
    if (!b && evt!="no") evt.currentTarget.className += " active";

	//mylog("changed tab");
}
console.log("loaded tab.js");
addTabEv();



