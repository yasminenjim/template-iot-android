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
//fhttp.seturl("http://localhost:8000");
// 
//flogfile.init();
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
function onascii(txt, ch) {
    if (txt.indexOf("can") != 0) return;

    var tbody = document.getElementById("can-msgs");

    if (tbody) {
        if (tbody.rows.length >= 100) {
            tbody.deleteRow(-1);
//here I want to create a div element in the onsen page with the id notifications
//console.log("the Can table reached 100 rows");

console.log("the Can table reached 100 rows");

// Create notification
var notificationPage = document.querySelector('#notifications');
var notificationElement = document.createElement('div');
notificationElement.innerHTML = '<p>New CAN message received</p>';
notificationElement.setAttribute('id', 'notifications'); // Set ID to "can-notification"
notificationPage.appendChild(notificationElement);
tactile();
        }

        var cobid = txt.substr(3, 3);
        var cid = parseInt(cobid, 16);
        var nodeid = 127 & cid;
        var len = (txt.length - 6) / 2;

        // Calculate start and end row indices based on currentPage and rowsPerPage
        var rowsPerPage = 20;
        var startIdx = (currentPage - 1) * rowsPerPage;
        var endIdx = startIdx + rowsPerPage;

        // Hide all rows first
        for (var i = 0; i < tbody.rows.length; i++) {
            tbody.rows[i].style.display = "none";
        }

        // Insert new row at the start index
        var row = tbody.insertRow(startIdx);
        row.insertCell(0).innerHTML = "0x" + cobid;
        row.insertCell(1).innerHTML = "[" + nodeid + "]";
        row.insertCell(2).innerHTML = len;

        var dataCell = row.insertCell(3);
        for (var i = 0; i < len; i++) {
            var dataByte = txt.substr(6 + i * 2, 2);
            dataCell.innerHTML += " 0x" + dataByte;
        }

        // Show rows for the current page
        for (var i = startIdx; i < endIdx && i < tbody.rows.length; i++) {
            tbody.rows[i].style.display = "";
        }
    }
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
