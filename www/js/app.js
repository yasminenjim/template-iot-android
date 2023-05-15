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
//---------------------------------------------------------------------------
//AO boxes
/** 
function setAOModuleCurrent(moduleNumber, channelNumber, mA) {
  // Create a JSON object with the "ao" key and the module number, channel number, and mA value
  var json = {"ao": {"nr": moduleNumber, "c": channelNumber, "mA": mA}};

  // Convert the JSON object to a string
  var jsonString = JSON.stringify(json);

  // Send the string over BLE to the C++ code
  ble.write(deviceId, serviceUUID, characteristicUUID, jsonString, successCallback, errorCallback);
}*/

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
