/*
https://github.com/apache/cordova-plugin-file
cordova plugin add cordova-plugin-file
https://cordova.apache.org/docs/en/1.6.1/cordova/file/fileentry/fileentry.html
flogfile.init(); // in app.js
*/
flogfile=(function(){
console.log("init flogfile");
let config= {
	maxlength:1024*1024,
	fname: 'logfile.dat'
}
//-----------------------------------------------------------------------------
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


var logobject={fileentry:null,direntry:null,maxlength:1024*1024,size:0};
//-----------------------------------------------------------------------------
function onErrorCreateFile(e){
console.log("onErrorCreateFile"); 
}
function onErrorLoadFs(e){
console.log("onErrorLoadFs"); 
}
function onErrorReadFile(e){
console.log("onErrorReadFile");
}
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function mylogini(){
 console.log("mylogini cordova.file "+cordova.file);  
 logobject.fname=config.fname;
 console.log("createlogfile "+logobject.fname);
 createlogfile();
}
//-----------------------------------------------------------------------------
function createlogfile(){
        var platformid=cordova.platformId;
	console.log("createlogfile platform "+platformid); 
	if (platformid.indexOf("browser")==0) return; // not for browser
	window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (dirEntry) {
              logobject.direntry=dirEntry;
	       console.log('direntry for logfile '+JSON.stringify(dirEntry)); 
	
		 dirEntry.getFile(logobject.fname, {create: true, exclusive: false}, function(fileEntry) {   
		   logobject.fileentry=fileEntry;
                   getlogfilesize();
		   console.log("create  "+logobject.fname ); 
		 },onErrorCreateFile);

	},onErrorLoadFs); 
}
//-----------------------------------------------------------------------------
function getlogfilesize(fe){
logobject.fileentry.createWriter(function (fileWriter) {
	var size=fileWriter.length;
	console.log("size is ",size);
	logobject.size=size;
	                                               });
//or
logobject.fileentry.file(function(f){
console.log("file size "+f.size+" last modified"+f.lastModifiedDate); 	
});
}

//---------------------------------------logobject-------------------------------------
function writetolog(txt,wd){
        var platformid=cordova.platformId;
	if (platformid.indexOf("browser")==0) return;  // not 
	logobject.fileentry.createWriter(function (fileWriter) {
           fileWriter.onwriteend = function() {                                                                            
            //console.log("Successful write to logfile");                                                                    
           return true;  
	   };       
            fileWriter.onerror = function (e) {                                                                             
            console.log("Failed file write: " + e.toString()); 
		    return false;
        };
           try {   
	  var l=fileWriter.length;	   
	  if (l>=logobject.maxlength) {
		                   // we loose a datapoint
		                   clearmylog(true); 
		                   return;
		                      }
	   logobject.size=l; // store current size	   
	   fileWriter.seek(l); // go to end

	   }
	  catch(e) {
		   console.log("file doesn't exist!");
		   return;
		   }
         var a="";
	 if (wd) {	
         var d=new Date();
	 d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
         a=d.toISOString(); 
	 a=a.replace(/[TZ]/g,' '); 	 
	 	 
	 }
       	 fileWriter.write(a+txt);
});
}
//-----------------------------------------------------------------------------
function getdatestring(){
var d=new Date;
var s=d.toLocaleString('en-ZA'); 
s=s.replace(/[\/, :]/g,'').substr(0,12);
return s;
}
//-----------------------------------------------------------------------------
function clearmylog(keep,fe){
var fentry=logobject.fileentry; //default
console.log("clear "+fentry.name);	

if (fe) {
        fentry=fe;
        keep=false; // don't allow keep in case fe
	console.log(fe.name.indexOf(logobject.fileentry.name));
    if (fe.name.indexOf(logobject.fileentry.name)==0) {
	     //alert("don't delete here");
	     // return;
	      keep=true; // 
	                                   }
    }
	
if (keep) {
        var s=getdatestring();
	var fname=s+"_"+logobject.fname;
	var parentEntry = logobject.direntry; //new DirectoryEntry({fullPath: "./"});
	console.log("new name "+fname+" to "+parentEntry.fullPath); 
	logobject.fileentry.copyTo(parentEntry,fname, function(e){
	console.log("copy success");
	//now clear	
	clearmylog(false);
		
	}, function(e){
	console.log("copy failed "+e+" "+JSON.stringify(e));  
	});
	return;
	  }

fentry.remove(function() {
      // delete successful
      console.info('logfile has been deleted successfully.');
      // create again
       createlogfile();    	
     }, function(error) {
     // delete failed
     console.error('Could not delete logfilefile. ' + JSON.stringify( error ));
    });

	
}
//-----------------------------------------------------------------------------
function getlogfilecontent(fe){
var fentry=logobject.fileentry;
if (fe) {
	console.log("show for "+fe.name); 
    fentry=fe;
        }
let ret=new Promise(function(resolve,reject){
  fentry.file(function (file) {
	  console.log("size is "+file.size);
	   var reader = new FileReader();   
	    reader.onloadend = function() {                                                                                 
	    var ret=this.result;
	     console.log("Successful file read: "+ret.length);		   
             resolve(ret);
	 };

	 reader.readAsText(file);     
        },function(){reject("null")});
});

return ret;
}
//-----------------------------------------------------------------------------
function getlogdir(myfunc){
if (!logobject.direntry) {
	          console.log("logobject.direntry null?");
	   return;
	                 }
var directoryReader = logobject.direntry.createReader(); 
	if (directoryReader) {
	 logobject.dirarray=[];	
         directoryReader.readEntries(function(entries){
	     var i;
	 console.log("getlogdir "+entries.length);	 
        for (i=0; i<entries.length; i++) {
              logobject.dirarray.push(entries);
             console.log(i+"  "+entries[i].name);
             if (typeof myfunc==="function") myfunc(i,entries[i]);
		else console.log("no function ? "+typeof myfunc); 

	}
	 },function(){});
		             }

}
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function showfilefunc(fe){
getlogfilecontent(function(s){
if (s.length==0) {
	 console.log("empty file "); 
	return;
	         }
s=s.substr(-256);
s=s.replace(/\n/g,"<br>");   
console.log(s);
},fe);
}
//-----------------------------------------------------------------------------
function restartlogfunc(){
if (confirm("restart log? ")) {
	                      console.log("clear "); 
	                      clearmylog(true); 
	                      }
}
//-----------------------------------------------------------------------------
return {
	config: setconfig,
        init :  mylogini,
	write : writetolog,
	getcontent : getlogfilecontent,
        getdir : getlogdir,
        clear : clearmylog
 }
})();

