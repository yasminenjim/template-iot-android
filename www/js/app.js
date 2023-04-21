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
function onascii(txt,ch){
//console.log("onascii "+txt);
if (txt.indexOf("can")!=0) return;

var d=document.getElementById("canmsg");

	if (d) {
	
		if (d.innerHTML.length>2500) {
			d.innerHTML=d.innerHTML.substr(-800);
			                     }
		var cobid=txt.substr(3,3);
                var cid=parseInt(cobid,16);
                var nodeid=127 & cid;
		var len=(txt.length-6)/2;
		var canstr="0x"+cobid+" ["+nodeid+"] "+len+" ";

		for (var i=0;i<len;i++) {
	             canstr+=" 0x"+txt.substr(6+i*2,2);
			                }
                d.innerHTML+=canstr+"<br>";
	        d.scrollTop=d.scrollHeight;
	        }
d=document.getElementById("canmsg0");
if (d) d.innerHTML=canstr;	
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
