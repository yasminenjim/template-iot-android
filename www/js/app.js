/*
 app related stuff

add functions wo docelement
fvar.addfnc2var({name:"data.di",fnc:difnc});
*/

//-----------------------------------------------------------------------------
var startdate=new Date(); 
var b_log=true;
var lstsend=Date.now();
var dtapploop=1000; //ms
var ctr=0;
var datactr=0;
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function onappstart(){
fvar.scan(); 
fvar.addfunc("log", mylog); 
fvar.addfunc("sendbtjson", fble.sendjson); 	
// tabs	
//document.getElementById("mainbt").addEventListener("click",openTab,false); 
//document.getElementById("settingsbt").addEventListener("click",openTab,false);
//document.getElementById("btoothbt").addEventListener("click",openTab,false);
/***
document.addEventListener('prepush', function(event) {
	var page = event.target.topPage;
	if (page.id === 'bluetooth') {
	  var btScanButton = page.querySelector('#bt_scan');
	  btScanButton.addEventListener('click', function() {
		// Perform the Bluetooth scan here
	  });
	}
  }); ***/
//document.getElementById("debugbt").addEventListener("click",openTab,false);
//set btooth tab
//document.getElementById("btooth").style.display = "block";
//---------------------------------------------------------------------------
//you can change the parametres when you call fble function
fble.config({btservice:"7f190f68-2749-493c-947f-193fe27fd4cb",btnamefilter:"ble"});  

if (cordova.platformId === "android") {

	
	
fble.onsubscribed(function(){
	                console.log("we subscribed to bt server"); 
                        fble.readchar("2002"); 
                        openTab("no","main"); //
                        });

fble.ondisconnected(function(){
	                console.log("we disconnected from bt server"); 
	                var d=document.getElementById("irel"); 
	                d.style.background="red";
                         });
fble.ongotjson(function(jo,ch){

fvar.parse(jo);	
	
//console.log("got json "+JSON.stringify(jo));
if (jo.hasOwnProperty("whatever")) {

	 return;
	                           }

});
fble.start();  
}


var el = document.getElementById('jsontest');
if(el){
  el.addEventListener('keypress', fble.testjson, false);
}


/* document.getElementById("jsontest").addEventListener("keypress",fble.testjson,false);
console.log("btstarted"); 	 */
//-----------------------------------------------------------------------------
//send "reboot" to the esp32

/* document.getElementById("bt_restart").addEventListener("click",function(e){
if (!confirm("restart esp?")) return;

fble.sendjson({"reboot":true});  
},false);
 */




startapploop();

}
//-----------------------------------------------------------------------------
function apploop(){
ctr++;
if (cordova.platformId === "android") {

 if(ctr%5==0) fble.getrssi();  
 if (ctr%11==0) fble.readchar("2002");
 
}
}
//-----------------------------------------------------------------------------
//
function startapploop(){

window.setInterval(function(){

apploop();
} ,dtapploop); // intervall
}
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function testbt(){
//sendbt("hallo bt\n");
var o={bla:1};	
fble.sendjson(o);	
}
//-----------------------------------------------------------------------------





