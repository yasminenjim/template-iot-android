console.log("loading app.js");	

function onappstart(){
console.log("we are on "+cordova.platformId);
// crobot 7f190f68-2749-493c-947f-178fe27fd4bc
// youvee  7f190f68-2749-493c-947f-193fe27fd4bc
// igauge 7f190f68-2749-493c-947f-193fe27fd4cb
// bletest 7f190f68-2749-493c-947f-193fe27fd4cb
fble.config({btservice:"7f190f68-2749-493c-947f-193fe27fd4cb",mtu:200});   
if (cordova.platformId === "android") { 	
fble.start();
}	
fvar.addfunc("sendbtjson", fble.sendjson);  
fble.ongotjson(onjson);  
fble.ongotmsg(onascii); 

fhttp.seturl("http://localhost:8000");
flogfile.init();
fOTA.config({fname:"firmware.zip"});
fOTA.init();
}
//-----------------------------------------------------------------------------
function apponsubscribed(){
 fble.sendjson({act:"info"});
 setTimeout(()=>{
 fble.subscribe("2002");  
 },2000);
}
//-----------------------------------------------------------------------------
function onjson(o,ch){
//console.log("onjsonfunc  "+JSON.stringify(o));
fvar.parse(o);
let e=document.getElementById("char2001");
if (e) {
	e.innerHTML=JSON.stringify(o);
       }
}
//-----------------------------------------------------------------------------
//-----------------------the function for filling the CAN msgs table-------------
function onascii(txt, ch) {
  if (txt.indexOf("can") != 0) return;

  var tbody = document.getElementById("can-msgs");

  if (tbody) {
    //max 100 rows in the table
    if (tbody.rows.length >= 100) {
      tbody.deleteRow(-1);
      updateNotification("Table reached 100 rows!");
      var notificationCount = 1;
      updateNotificationCount(notificationCount);
    }

    var cobid = txt.substr(3, 3);
    var cid = parseInt(cobid, 16);
    var nodeid = 127 & cid;
    var len = (txt.length - 6) / 2;

    var row = tbody.insertRow(0);
    var now = new Date();
    var time = now.toISOString().slice(11, 23);

    row.insertCell(0).innerHTML = time;
    row.insertCell(1).innerHTML = "0x" + cobid;
    row.insertCell(2).innerHTML = "[" + nodeid + "]";

    var dataCell = row.insertCell(3);
    for (var i = 0; i < len; i++) {
      var dataByte = txt.substr(6 + i * 2, 2);
      dataCell.innerHTML += " 0x" + dataByte;
    }
  }
}
//--------------------------------------------------------------------------
function updateNotification(message) {
  // Update the DOM in notifications.html
  var notificationDiv = document.getElementById("notification-content");
  if (notificationDiv) {
    // Get the current date and time
    var now = new Date();
    var hours = now.getHours().toString().padStart(2, "0");
    var minutes = now.getMinutes().toString().padStart(2, "0");
    var timeString = hours + ":" + minutes;

    // Update the time display
    var timeElement = notificationDiv.querySelector(".notification-time");
    if (timeElement) {
      timeElement.textContent = timeString;
    }

    // Update the message content
    var messageElement = notificationDiv.querySelector(".notification-content");
    if (messageElement) {
      messageElement.textContent = message;
    }

    // Save the message in localStorage
    localStorage.setItem("notificationMessage", message);

    // Show the notification
    notificationDiv.classList.add("show");
  }
}

// Function to update the notification count and display it
function updateNotificationCount(count) {
  var notificationCountElement = document.getElementById("notification-count");
  if (notificationCountElement) {
    notificationCountElement.textContent = count;
    notificationCountElement.style.display = count > 0 ? "inline-block" : "none";
  }
}

// Check if there is a saved notification message in localStorage
var savedNotificationMessage = localStorage.getItem("notificationMessage");
if (savedNotificationMessage) {
  updateNotification(savedNotificationMessage);
}
//-----------------------------------------------------------------------------
function inputkeydown(e){
                  let t=e.currentTarget;
		  //console.log("onkeydown "+t.id+" "+e.keyCode+"  "+t.value);
                  if (e.keyCode==13) {
			        console.log("return with "+t.value);
                          try {
			  let o=JSON.parse(t.value);	  
			  onjson(o);
			  toast(t.value);	  
			  }
			  catch (e){
				   toast("no json");
				  console.log("no json "+e); 
			  }
		   }
		}
//-----------------------------------------------------------------------------

function tactile(d){
if (!d) d=60;
//console.log("tacile "+cordova.platformId); 	
	     if (cordova.platformId.indexOf("ios")==0) {
		      if (window.TapticEngine)  TapticEngine.unofficial.weakBoom();
		                      }
	     if (cordova.platformId.indexOf("android")==0){
	    navigator.vibrate(d);
		  }
}
