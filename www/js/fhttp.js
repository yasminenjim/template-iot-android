/*
?? https://github.com/aporat/cordova-plugin-fetch
cordova plugin add cordova-plugin-fetch

for self signed certificates: openssl req  -nodes -new -x509  -keyout server.key -out server.cert     
cordova-plugin-advanced-http  
https://github.com/silkimen/cordova-plugin-advanced-http

auth, using stoken?

	*/

fhttp=(function(){
console.log("init fhttp");
let url="";
let cgi="";
let port=null;	

let localip="";	
//-----------------------------------------------------------------------------
function seturl(u,cgi){
url=u;

return this;	
}
//-----------------------------------------------------------------------------
if (cordova.plugin && cordova.plugin.http) cordova.plugin.http.setServerTrustMode('nocheck', function() {
  console.log('nocheck success!');
}, function() {
  console.log('nocheck error :(');
});
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
function send(data,url_){
if (url_) url=url_;	
if (!url || url==="") {
	          alert("no url");
	          return;
	              }
var options={
method: 'POST',
mode: 'no-cors', // no-cors, *cors, same-origin
cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
//credentials: 'same-origin', // include, *same-origin, omit
headers: {'Content-Type': 'application/json','myfoo':'bar','User-Agent':'mycordova' },
body: JSON.stringify(data)	
}
console.log("fhttp.send "+url+" "+JSON.stringify(data));

var ret=new Promise(function(resolve,reject) {
//fetch(url,options)
cordovaFetch(url,options)
.then((r) => {
	  console.log("fetch");
	  return r.json();
          })
  .then((data) => {console.log("data: "+JSON.stringify(data));
                   resolve(data);
                  })
  .catch((e) => {reject('Booo '+e);});
}); 
return ret;
}
//-----------------------------------------------------------------------------
function send2(d,url){
const options = {
  method: 'post',
  data: d
 // headers: {Authorization:'frenell',"Content-Type":"application/json"}	
  //headers: { Authorization: 'OAuth2: token' }
};

if (cordova.plugin.http) {
cordova.plugin.http.setDataSerializer('json');
}

var ret=new Promise(function(resolve,reject) {
cordova.plugin.http.sendRequest(url, options, function(response) {
  // prints 200
  console.log(response.status+" "+response.url);
  resolve(response.data); 	
}, function(response) {
  // prints 403
  console.log("error with status "+response.status);

  //prints Permission denied
  console.log(response.error);
  reject(response.error);	
 });
});
return ret;
}

//-----------------------------------------------------------------------------
return {
	seturl:seturl,
	send:send,
	send2:send2
}


})();

