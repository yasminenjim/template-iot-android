//def our service
var urat_service={
	service_UUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
	notif_charac:'6e400002-b5a3-f393-e0a9-e50e24dcca9e',
	write_charac:'6e400003-b5a3-f393-e0a9-e50e24dcca9e'
};

//********************************************************



document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {

  mylog("starting...");	
  onappstart();
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    var btnOpenFile = document.getElementById("btnOpenFile");


}

//This for a simple check for the credentials and navigation to home page (charging it in the pages slack)
const login = () => {
  const username = document.querySelector('#username').value;
  const password = document.querySelector('#password').value;

  if (username === '' && password === '') {
    const navigator = document.querySelector('#navigator');
    navigator.resetToPage('home.html');
  } else {
    ons.notification.alert('Wrong username/password combination');
    console.log("wrong login");
 
  }
}


//************************************************//

var app = {
  // Application Constructor
  initialize: function() {
      console.log("screen " + screen.width + "x" + screen.height);

      console.log('calling app.js from index.js' );

     // document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  
  },
  // deviceready Event Handler
  // Bind any cordova events here. Common events are:
  // 'pause', 'resume', etc.
//onDeviceReady: function() {
  //    this.receivedEvent('deviceready');
// //-----------------------------------------------------------------------------
//mylog("starting...");	    

 
//start from app.js	
//onappstart();

//-----------

};

 /**  // Update DOM on a Received Event
  receivedEvent: function(id) {
      var parentElement = document.getElementById(id);
      console.log('Received Event: ' + id);
  };*/

app.initialize();


//**************************************************************** */
 
//-----------------------------------------------------------------------------
function mylog(txt, clear) {
  if (!b_log) return;
  var d=document.getElementById("mylog");
  if (!d) return;
  if (clear) d.innerHTML = "";
  d.innerHTML += txt + "<BR>";
}
//-----------------------------------------------------------------------------
function tactile(){
//console.log("tacile "+cordova.platformId); 	
     if (cordova.platformId.indexOf("ios")==0) {
        if (window.TapticEngine)  TapticEngine.unofficial.weakBoom();
                        }
     if (cordova.platformId.indexOf("android")==0){
    navigator.vibrate(60);
    }
}

//app.initialize();