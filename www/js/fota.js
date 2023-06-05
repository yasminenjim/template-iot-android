/*
cordova plugin add wifiwizard2
cordova plugin add https://github.com/apache/cordova-plugin-file-transfer.git
cordova plugin add cordova-plugin-zip
don't use downloader anymore
usesClearTextTraffic
cordova plugin add cordova-plugin-enable-cleartext-traffic


cordova plugin add cordova.plugins.diagnostic
??
cordova plugin add cordova-plugin-network-information 
cordova plugin add https://github.com/Whebcraft/Cordova-Mobile-Data.git
todo: 
      get device info only if connected to internet
      switch off mobile data
      spinner while scanning for wifi
      show in overview the connection to which SSID and whether connected to internet
     
      show upload success?? reconnect via bt ?
*/

fOTA=(function(){
console.log("loading fOTA.js"); 
let config= {
	folder:"firmware",ssidbasename:["OTA","whatever"],fwname:"firmware.zip",user:"admin",pw:"frenell",
	www:"https://www.frenell.de/download/"
	    }

function setconfig(obj) {
        for (var key in obj) {
            console.log("key " + key + " " + obj[key]);
            if (config.hasOwnProperty(key)) {
                config[key] = obj[key];
            }
        }
        console.log(JSON.stringify(config));
}
//-----------------------------------------------------------------------------

let fwupdobj={bin:"",binurl:"",version:""};          
//-----------------------------------------------------------------------------
function init(){
console.log("fOTA init"); 	
//create folder if not yet existant
window.resolveLocalFileSystemURL(cordova.file.dataDirectory
	       ,function(dirEntry){ 
	               dirEntry.getDirectory(config.folder,{create: true, exclusive: false}, function(dE) {
			      console.log("created diri "+config.folder); 
		            getfirmware(); // set upload
		       },function(e){console.log("error creating directory "+e);});
	        }
	       ,function(e){
	         console.log("failed "+config.folder); 
	       });


}
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function download2(fn){  // get binary from server
var downloadname=config.fwname;	
if (fn && fn.length>5) downloadname=fn; // at least 5 characters 

let ret=new Promise((resolve,reject)=>{

progressFunction(null,"down"); 	

var oReq = new XMLHttpRequest();
//avoid cached data
var url=config.www+downloadname+'?_time=' + (new Date()).getTime();
 console.log("trying to get "+url); 
 oReq.open("GET", url, true);	
 oReq.responseType = "blob";
   oReq.onerror= (e)=>{ 
	                console.log("XMLHttpRequest error"); 
	                reject("errror");
                      };
	oReq.onprogress = function(event) {
		progressFunction(event,"down");   
		console.log("received "+event.loaded+" of  "+event.total);
	}
  oReq.onload = function (oEvent) {
	    console.log(oReq.status+" state "+oReq.readyState+" oEvent "+oEvent);
        if(oReq.status == 404) {
		  reject("not found");
		  return;
		               }
            var blob = oReq.response;
	    if (blob) {
		     console.log("blob");
		     var bloburl = window.URL.createObjectURL(blob); 
		     console.log("bloburl "+bloburl);
		     saveBlob2File(config.fwname,blob);
		     resolve("done");
		      }
		 else {
			  console.error('we didnt get an XHR response!');
		      reject("error");
		      }
            };
oReq.send(null);
});
return ret;
}
//-----------------------------------------------------------------------------
function saveBlob2File (fileName, blob) {
        var folder = cordova.file.dataDirectory + config.folder;
	console.log("save "+fileName+" to "+folder);
        window.resolveLocalFileSystemURL(folder, function (dirEntry) {
          console.log('file system open: ' + dirEntry.name)
          createFile(dirEntry, fileName, blob);
        }, function(e){
	console.log("error dataDirectory "+folder); 
	})
}
//-----------------------------------------------------------------------------
      function createFile (dirEntry, fileName, blob) {
        // Creates a new file
        dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
          writeFile(fileEntry, blob)
        }, function(e){console.log("could not create file "+e); })
      }

      function writeFile (fileEntry, dataObj) {
        // Create a FileWriter object for our FileEntry
        fileEntry.createWriter(function (fileWriter) {
          fileWriter.onwriteend = function () {
            console.log('Successful file write...  '+fileEntry.name);
          var path=cordova.file.dataDirectory + config.folder+"/"+fileEntry.name; 
	  console.log("path: "+path);
		  var fileUrl = fileEntry.toURL();
	  zip.unzip(fileUrl, cordova.file.dataDirectory + config.folder , function(e){
	    if (e==0) console.log("unzipped "); else console.log("unzipping failed "+e); 
	    fileEntry.remove(function(){console.log("removed");},function(){});
	  });
	  
	  }

          fileWriter.onerror = function (error) {
            console.log('Failed file write: ' + error)
          }
          fileWriter.write(dataObj)
        })
      }
//-----------------------------------------------------------------------------
function getfirmware(f){ // all downloaded firmware files

console.log("getfirmware "+cordova.file.dataDirectory+"/"+config.folder);

	window.resolveLocalFileSystemURL(cordova.file.dataDirectory+"/"+config.folder,
	   function (fileSystem) {
		   var reader = fileSystem.createReader(); 
		    reader.readEntries( 
			     function (entries) {
				     console.log("entries "+entries.length);
			              for (i=0; i<entries.length; i++) {
					      console.log("name: "+entries[i].name);
					      // also check entries[i].name.indexOf()
					      //  
					      if (entries[i].name.indexOf(".bin")>3) {
						   if (typeof f==="function") f(entries[i].name);
	
						   if (fwupdobj.bin.length<=1) {   
						   fwupdobj.bin=entries[i].name; 
						   fwupdobj.binurl=entries[i].toURL();
						   var pos=fwupdobj.bin.indexOf("_V");
						   var version=fwupdobj.bin.substr(pos+2);
						   pos=version.indexOf(".bin"); 
						   version=version.substr(0,pos);
						   fwupdobj.version=version;
						   //document.getElementById("divdwninfo").innerHTML+=fwupdobj.bin+" version "+version;
						   console.log("fw set to "+fwupdobj.bin+" version "+version);
						   }
					           }
					                               }
			     },
                                function (err) {                                                                                                
          console.log("err entries "+err);                                                                                    
        }                                                                                                               
      );                                                                                                                
    }, function (err) {                                                                                                 
      console.log("err resolve FileSys "+err);                                                                                
    });             
}
//-----------------------------------------------------------------------------
function cleanfiles(fnrm){
	console.log("clean files in "+cordova.file.dataDirectory+config.folder+"  "+fnrm);
 let ret=new Promise((resolve,reject)=>{
	window.resolveLocalFileSystemURL(cordova.file.dataDirectory+config.folder,
	   function (fileSystem) {
		   var reader = fileSystem.createReader(); 
		    reader.readEntries( 
			     function (entries) {
				     console.log("entries "+entries.length);
			              for (i=0; i<entries.length; i++) {
					      console.log(i+"  "+entries[i].name+"   "+fnrm);
					      var b_rm=false;
					      var fname=entries[i].name;
					      // only delete fnrm if existant
					      if (fnrm) {
						      if (fname === fnrm) b_rm=true;
					                }

                                                 else {

					       if (entries[i].name.indexOf(".bin")>3 || 
					           entries[i].name.indexOf(".zip")>3) b_rm=true; 

						 }
                                                  
						if (b_rm) {
						         console.log("remove "+fname);
						         entries[i].remove(function () {
							 console.log("removed file ");
							 if (fnrm===fwupdobj.bin) { // set to "" 
								      fwupdobj.bin="";
								      fwupdobj.binurl=""; 
								                }
							 },
            function (error) {
                console.log('Unable to remove file.');
            });
						            }
					                               }
				      resolve("done");
			     },
                                function (err) {                                                                                                
          console.log("err entries "+err);
	  reject(err);				
        }                                                                                                               
      );                                                                                                                
    }, function (err) {                                                                                                 
      console.log("err resolve FileSys "+err);                                                                                
    });             
 });
return ret;
}	
//-----------------------------------------------------------------------------
function uploadfnc(successfunc){
 console.log("upload "+fwupdobj.bin);
  if (fwupdobj.bin=="") {
	                alert("no firmware downloaded");
	                return;
	                }
isconnectedtodevice().then((r)=>{
// only upload if connected to ssid and no internet		
uploadfile("upload",fwupdobj.bin,fwupdobj.binurl,successfunc); 

},(e)=>{alert(e);});
}
//-----------------------------------------------------------------------------
function uploadfile(arg,name,furl,successfunc) { 
var url="http://"+config.user+":"+config.pw+"@192.168.4.1/"+arg;
//url="http://admin:frenell@10.0.0.95:8081/"+arg;
var options = new FileUploadOptions();                                                                                  
options.fileKey = "file";      
//options.chunkedMode=true;
options.chunkedMode=false; 	
options.mimeType="application/octet-stream";  
options.fileName = name;  
options.httpMethod="POST";   
progressFunction();  
var ft = new FileTransfer();                                                                                            
                                                                                                                        
ft.onprogress = function(pevt) {                   
                             progressFunction(pevt,"up");
                               };	
//document.getElementById("divuploadinfo").innerHTML="upload "+name+" "+url;

console.log("furl "+furl+" "+encodeURI(url)); 	
ft.upload(furl, encodeURI(url), function(r){  
 console.log("Code = " + r.responseCode); 
 console.log("Sent = " + r.bytesSent); 
  //document.getElementById("divuploadinfo").innerHTML="upload successful ";
  console.log("uploadsuccessful"); 
  if (typeof successfunc==="function") successfunc(); 
},
  function(r){ 
	  console.log("error "+JSON.stringify(r));
	   alert("upload error "+r.code); 
	   progressFunction(null,"up");
	    },options);

}
//-----------------------------------------------------------------------------
function progressFunction(evt,w){ 
	 let idp="dwnprogress";
	 let idpc="dwnpercent";
   if (w === "up"){
    idp="upprogress";
    idpc="uppercent";	   
   }
         var progressBar = document.getElementById(idp);  
         var percentageDiv = document.getElementById(idpc);
	  //mylog("progess "+evt);
	 if (!evt) { // settozero
		  progressBar.value = 0;
		  percentageDiv.innerHTML ="";
		  //mylog("set0");
		  return;
		   }
         if (evt.lengthComputable) {  
           progressBar.max = evt.total;  
           progressBar.value = evt.loaded;  
	   percentageDiv.innerHTML = Math.round(evt.loaded / evt.total * 100) + "%";  
         }  
 } 
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function connected2ssid(){
let ret=new Promise(function(resolve,reject) {
	if (WifiWizard2) {
			      WifiWizard2.getConnectedSSID().then(function(res){ 
				         resolve({res});
				                                               },
			              (e)=>{reject(e);})
			      } else reject("no wifiwizard");
 });
return ret;	
}
//-----------------------------------------------------------------------------
function GETrequest(ip,w,onjson,errorfnc){
console.log("GET "+ip+"/"+w);
var url='http://'+ip+"/"+w;
var username=config.user;
var password=config.pw;
var enc=window.btoa(username + ':' + password);
console.log(url+"   "+enc);

var tId=setTimeout(function(){
	     if (errorfnc) errorfnc({error:"no connection",nr:0});
		     },2500);  

var ajaxRequest=new XMLHttpRequest();                                                                           
ajaxRequest.onreadystatechange = function() {
  console.log("httpreq "+ajaxRequest.readyState+"  "+ajaxRequest.status);
  if (ajaxRequest.readyState == 4) {
    clearTimeout(tId);	  
	  if (ajaxRequest.status == 200) {
		  console.log(ajaxRequest.responseText); 
	      if (ajaxRequest.getResponseHeader("Content-Type") == "application/json") { 	  
		      var obj=JSON.parse(ajaxRequest.responseText);
		      if (onjson) onjson(obj);
	      }
	     }
	   if (ajaxRequest.status == 401) {
		   console.log("401 noauth");
		   if (errorfnc) errorfnc({error:"noauth",nr:401});
					  }
	   }
};   
ajaxRequest.open("GET", url,true);	
ajaxRequest.setRequestHeader("Authorization", "Basic " + enc); 	
ajaxRequest.send();
}
//-----------------------------------------------------------------------------
function connecttossid(fwssid){
console.log("try to connect to "+fwssid);
	
let ret=new Promise(function(resolve,reject){

 WifiWizard2.connect(fwssid).then(function(res){
 console.log("connected? "+res);
 if (res=="NETWORK_CONNECTION_COMPLETED") {
   
    var networkState = navigator.connection.type;
    /*
    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';
   */
	
    console.log("network state "+networkState);
    resolve("connected to "+fwssid);  
   }
  },function(){reject("connection failed");});

	
});
return ret;	
}
//-----------------------------------------------------------------------------
function scanwifi(f) {
	var d = document.getElementById("divscanwifi");
	d.innerHTML = ""; // Clear the existing content
	
	WifiWizard2.scan().then(function(res) {
	  console.log("scan " + JSON.stringify(res));
	  const wifiArray = res.map(network => network.SSID);
	  console.log(wifiArray);
	
	  res.forEach(function(o, i) {
		console.log(i + " " + o);
		let b_show = false;
		config.ssidbasename.forEach(function(p) {
		  if (o.SSID.indexOf(p) >= 0) b_show = true;
		});
	
		if (b_show) {
		  if (typeof f === "function") f(o.SSID);
		  console.log("found SSID " + o.SSID);
	
		  var p = document.createElement("p");
		  p.textContent = o.SSID + " " + o.level;
		  d.appendChild(p);
	
		  var btn = document.createElement("button");
		  btn.innerHTML = "Connect to " + o.SSID + " " + o.level;
		  btn.ssid = o.SSID;
		  btn.setAttribute("id", "btn_ssid_" + i);
		  btn.className = "longbutton";
		  btn.addEventListener("click", function(event) {
			tactile();
			console.log("clicked " + event.target.ssid);
			connecttossid(event.target.ssid);
		  });
		  d.appendChild(btn);
		}
	  });
  
	  // Create a list element
	  var ul = document.createElement("ul");
  
	  // Iterate over the wifiArray
	  wifiArray.forEach(function(ssid) {
		// Create a list item for each SSID
		var li = document.createElement("li");
		li.textContent = ssid;
		ul.appendChild(li);
	  });
  
	  // Append the list to the divscanwifi element
	  d.appendChild(ul);
	});
  }
  
//-----------------------------------------------------------------------------
function checkfnc(){
 console.log("checkfnc not used");
}
//-----------------------------------------------------------------------------
function showupload(){
return  fwupdobj.bin
}
//-----------------------------------------------------------------------------
function setupload(fn){
// is fn in folder?
var fullpath=cordova.file.dataDirectory+config.folder+"/"+fn;

let ret=new Promise((resolve,reject)=>{ 	
 window.resolveLocalFileSystemURL(fullpath,
	   function (fileEntry) {
		  console.log("setupload file "+fn+" exists");
		  fwupdobj.bin=fileEntry.name;
		  fwupdobj.binurl=fileEntry.toURL();
		  resolve(fwupdobj.bin); 
	  },function(){
	  console.log("no "+fn);
	  reject("failed");	  
	  });
     });
return ret;	
}
//-----------------------------------------------------------------------------
function isconnectedtointernet(){
let ret=new Promise(function(resolve,reject) {	
 WifiWizard2.canConnectToInternet().then(function(res){
	    console.log("-> "+res); 
	    if (res==="IS_CONNECTED_TO_INTERNET") {
		     resolve(true);
		                                  }
	 else resolve(false);
    },
   (e)=>{
       console.log("isconnectedtointernet error "+e);	   
       reject(false);
   });
 
 });
 return ret;
}
//-----------------------------------------------------------------------------
function isconnectedtodevice(){
let ret=new Promise(function(resolve,reject){
//check if connected to ssid 
connected2ssid().then((rssid)=>{
           //---
          GETrequest("192.168.4.1","",function(o){ 
	  console.log("got "+JSON.stringify(o));   
	  resolve(o);
	        },
	 function(e){
	         console.log("failed to get info");
	         reject("failed");
		    });
      },
     (e)=>{ 
	      console.log("error "+e);
	     reject("not connected to AP ");
          });
     
  });
return ret;
}
//-----------------------------------------------------------------------------
return {
  config: setconfig,
  init : init,	
  check: checkfnc,
  download: download2,
  getfirmware:getfirmware,
  upload:uploadfnc,
  scanwifi:scanwifi,
  clear : cleanfiles,
  setupload : setupload,
  showupload : showupload, 
  connect: connecttossid,
  isconnectedtointernet: isconnectedtointernet,
  isconnectedtodevice : isconnectedtodevice,
  connected2ssid : connected2ssid
}

})();

