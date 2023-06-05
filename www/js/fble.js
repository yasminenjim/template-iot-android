/*


*/
fble = (function() {handleError
    let config = {
        btservice: "",
        btpassword: "frenell",
        scanbtnid: "bt_scan",
        sendchar: "2010",
	readchar: "2001",   
        btnamefilter: "",
	scantimeout: 5000,
	mtu: 128    
    }

    let foundDevices = [];
    let nrinfoundDevices;	
    let btconnected = false;
    let btestablished = false;
    let btctr = 0;
    let b_accesgranted = false;
    let btaddress = "";
    let b_scanning = false;
    let lastsendms = Date.now();
    let rssi=0;
    let onbtenabled = function(){}; //todo	
    let ondevicefound = function() {console.log("ondevicefound not defined");};
    let onbtsubscribed = function(){console.log("onsubscribed not defined");};
    let onbtdisconnected = function() {console.log("ondisconnected not defined");};
    let onreceivedbinary = function() {};
    let ongotmsg = function() {};
    let ongotjson = function() {};
    let onscanstop = function() {};  
    
//-----------------------------------------------------------------------------
    function setconfig(obj) {
        //console.log("setconfig " + JSON.stringify(obj));
        for (var key in obj) {
            console.log("key " + key + " " + obj[key]);
            if (config.hasOwnProperty(key)) {
                config[key] = obj[key];
            }
        }
        console.log(JSON.stringify(config));
    }
    //-----------------------------------------------------------------------------
    function blestart() {
        if (config.btservice === "") {
            alert("no btservice defined");
            return;
        }
        console.log("blestart " + config.btservice);
        console.log("deviceready platform" + window.cordova.platformId);

        bluetoothle.isEnabled(function(b) {
            console.log("bluetooth is " + JSON.stringify(b));
        });
        if (window.cordova.platformId === "ios") {
            console.log("we are on iOs ?");
            setTimeout(function() {
                btinit();
            }, 1000);
        }
        if (window.cordova.platformId === "android") {
            console.log("we are on android " + device.model);
            // does the trick for android                                                                                  
            bluetoothle.requestPermission(function(r) {
                console.log("req permission");

            }, handleError);
            //                                                                                                              
            // plugin diagnostic asks for background location                                                               
            cordova.plugins.diagnostic.isLocationEnabled(function(locationEnabled) {
                console.log("locationEnabled " + locationEnabled);
            }, function(error) {
                console.log("The following error occurred: " + error);
            });

            btinit();
        }
        console.log("bt started ?");
    }
    //-----------------------------------------------------------------------------
    function btinit() {
        new Promise(function(resolve, reject) {
            bluetoothle.initialize(resolve, reject, {
                request: true,
                statusReceiver: false // not for iOS ?
            });
        }).then(initializeSuccess, handleError);
    }
    //-----------------------------------------------------------------------------
    function defondevicefound(f){
   
        if (typeof f != "function") {
            alert("ondevicefound");
            return;
        }
	   ondevicefound=f; 
    }
    //-----------------------------------------------------------------------------
    function defonsubscribed(f) {
        if (typeof f != "function") {
            alert("onbtsubscribed");
            return;
        }
        onbtsubscribed = f;
    }
    //-----------------------------------------------------------------------------
    //-----------------------------------------------------------------------------
    function defdisconnect(f) {
        if (typeof f != "function") {
            alert("defdisconnect");
            return;
        }
        onbtdisconnected = f;
    }
    //-----------------------------------------------------------------------------
    function defongotmsg(f) {
        ongotmsg = f;
    }
  //-----------------------------------------------------------------------------

    function defonscanstop(f) {
        if (typeof f != "function") {
           // alert("onscanstop");
            return;
        }
        onscanstop = f;
    }
    //-----------------------------------------------------------------------------
    function defongotjson(f) {
        ongotjson = f;
    }
    //-----------------------------------------------------------------------------
    function isconnected() {
        return btconnected;
    }
    //-----------------------------------------------------------------------------
    function initializeSuccess(result) {
        console.log("init success bt " + result.status);

        if (window.cordova.platformId === "android") {
            //   console.log("adapterinfo?"); 
        }

        if (result.status === "enabled") {
            console.log("Bluetooth is enabled.");
	    onbtenabled(true);

            setTimeout(function() {
                startScan(); // shall we do this automatically ?
            }, 500);
        } else {
            onbtenabled(false);
        }
    }
    //-----------------------------------------------------------------------------
    function startScan() {
        if (config.btservice === "") {
            alert("no btservice defined");
            return;
        }
	if (b_scanning) {
		       console.log("already scanning");
		       return;
		        }
	    
        console.log("scanning... "+config.btservice);
        foundDevices = [];

        if (window.cordova.platformId === "android" || window.cordova.platformId === "ios") {
            bluetoothle.startScan(startScanSuccess, function(e) {
                console.log("startscanerror ");
                b_scanning = false;
		onscanstop();  // ?    
            }, {
                services: [config.btservice]
            });
        }
    }
    //-----------------------------------------------------------------------------
    function mystopscan() {
        bluetoothle.stopScan(function(e) {
            console.log("scan stopped");
            b_scanning = false;
	    onscanstop();	
        }, handleError);
    }
    //-----------------------------------------------------------------------------
    function startScanSuccess(result) {
        if (result.status === "scanStarted") {
		console.log("scan started");
            foundtime = "";
            b_scanning = true;
	    setTimeout(()=>{mystopscan()},config.scantimeout); //
            return;
	} 
	
	if (result.status === "scanResult") {
            if (foundtime != "") {
                var d = new Date;
                var difftime = (d.getTime() - foundtime.getTime()) / 1000.;
                if (difftime > 0.6) mystopscan(); //stop 0.6 sec after found  
            }

            if (!foundDevices.some(function(device) { // check if not already in list
                    return device.address === result.address;
                })) {
                foundtime = new Date;
                console.log('FOUND DEVICE: ' + result.address);
		    
	  if (config.btnamefilter !="") { // do we have a name filter ?
		if (result.name.indexOf(config.btnamefilter)!=0) {
			   return;
			                             }
		               }
		foundDevices.push(result);
                ondevicefound(result,foundDevices.length-1);
		console.log("add "+result.name);    

	    } /*
		else {
		     console.log("already in list  "+result.name); 
		   }
	      */
	return;	
        }
	console.log("fble unknown :"+result.status );     
    }
    //-----------------------------------------------------------------------------
    //-----------------------------------------------------------------------------
    function connect(address) {
     nrinfoundDevices=-1; 
     foundDevices.forEach(function(d,i){
	       if (d.address==address) nrinfoundDevices=i;
	                               });
     if (nrinfoundDevices==-1) {
	                      console.log("was not found in list "); 
	                       }
     if (b_scanning) mystopscan();
            new Promise(function(resolve, reject) {
                bluetoothle.connect(resolve, reject, {
                    address: address
                });
            }).then(connectSuccess, handleError);
    }
    //-----------------------------------------------------------------------------
    function connectSuccess(result) {
        console.log("connectedSuccess " + result.status);
        if (result.status === "connected") {
            console.log("connected " + JSON.stringify(result));
            btaddress=result.address; 
            btconnected = true;
            btname = result.name;
            if (cordova.platformId === "android") {
                console.log("set MTU "+config.mtu);
                //set mtu
                var params = {
                    address: result.address,
                    mtu: config.mtu
                }
                bluetoothle.mtu(function(res) {
                    console.log("mtu set ")
                }, handleError, params);
            }
            setTimeout(function() {
                getDeviceServices(result.address);
                btconnected = true;
            }, 1000);
        } else if (result.status === "disconnected") {
          ondisconnect();
	}
    }
    //-----------------------------------------------------------------------------
    function getDeviceServices(address) {
        console.log("Getting device services... " + address);
        var platform = window.cordova.platformId;
        if (platform === "android") {
            console.log("for android ");
            new Promise(function(resolve, reject) {
                bluetoothle.discover(resolve, reject, {
                    address: address
                });
            }).then(discoverSuccess, function(e) {
                console.log("getService error " + e);
            });
            console.log("*");
        } else if (platform === "ios") { // services only for ios
            new Promise(function(resolve, reject) {
                bluetoothle.services(resolve, reject, {
                    address: address
                });

            }).then(servicesSuccess, handleError);
        } else {
            console.log("Unsupported platform: '" + window.cordova.platformId + "'");
        }
    }
    //-----------------------------------------------------------------------------
    function discoverSuccess(result) { //android
        console.log("discoverSuccess " + result.status);
        if (result.status === "discovered") {
            atbtconnection();
        }
    }
    //-----------------------------------------------------------------------------
    function setMTU(mtu) {
        config.mtu = mtu;
        if (btconnected && cordova.platformId === "android") {
            var params = {
                address: btaddress,
                mtu: mtu
            };
            bluetoothle.mtu(function(result) {
                console.log("MTU set to " + mtu);
            }, handleError, params);
        }
    }
    //-----------------------------------------------------------------------------
    //only for ios ?
    function servicesSuccess(result) {
        if (result.status === "services") {
            var readSequence = result.services.reduce(function(sequence, service) {

                return sequence.then(function() {
                    new Promise(function(resolve, reject) {
                        bluetoothle.characteristics(resolve, reject, {
                            address: result.address,
                            service: service
                        });
                    }).then(characteristicsSuccess, handleError);
                }, handleError);
            }, Promise.resolve());
        }
    }
    //-----------------------------------------------------------------------------
    // ios                                                                ios
    function characteristicsSuccess(result) {
        if (result.status === "characteristics") {

            result.characteristics.forEach(function(characteristic) {
                console.log("char " + characteristic.uuid);
                //characts.push(characteristic.uuid);
            });
            atbtconnection();
        }
    }
    //-----------------------------------------------------------------------------
    function subscribednew() {
        var params = {
            "address": btaddress,
            "service": config.btservice,
            "characteristic": config.readchar,
	    "name":btname,
	    "nr":nrinfoundDevices	
        };
        console.log("subscribe to " + params.characteristic);
        bluetoothle.subscribe(function(result) {
            if (result.status === "subscribedResult") {
                btctr++;
                //console.log("subscribedResult "+JSON.stringify(result)); 
                var v = window.atob(result.value);
                gotline(v, result.characteristic); 
                return;
            }

            if (result.status === "subscribed") {
                atsubscribed();
		onbtsubscribed(params);      
            }
        }, handleError, params);
    }
    //-----------------------------------------------------------------------------
    function btreadchar(ch) {
        if (!btestablished) return;
        let params = {
            "address": btaddress,
            "service": config.btservice,
            "characteristic": String(ch)
        };
        //console.log("btreadchar "+JSON.stringify(params));
        bluetoothle.read(function(result) {
            let v = window.atob(result.value);
            gotline(v, ch);
        }, function(e) {
            console.log("error in btreadchar " + e);
        }, params);
    }
    //-----------------------------------------------------------------------------
    // onconnect
    function atbtconnection() { // after discovered services
        // if we want to show it document.getElementById("cbtname").innerHTML=btname;     
        setTimeout(function() {
            subscribednew();
        }, 500);
    }
    //-----------------------------------------------------------------------------
    function atsubscribed() {
        btestablished = true;

        setTimeout(function() {
            sendbtjson({
                "start": {
                    "msg": "hallo"
                }
            });
        }, 200);

    }
    //-----------------------------------------------------------------------------
    //-----------------------------------------------------------------------------
    function handleError(error) {
        if (typeof(error) === 'object') {
            var e = String(error.error);
            console.log("error " + e + " ");
            if (e.indexOf("isDisconnected") == 0 || e.indexOf("isNotC") == 0) {
                    disconnect();
		   //ondisconnect();
                return;
            }
            console.log("error " + JSON.stringify(error));

        } else {
            console.log("error " + error);
        }
    }
    //-----------------------------------------------------------------------------
    function disconnect() {
        var params = {
            address: btaddress
        }
        //close directly
        bluetoothle.close(function(result) {
            console.log("closed now");
            ondisconnect();
        }, handleError, params);
    }
    //-----------------------------------------------------------------------------
    function ondisconnect() {
        btconnected = false;
        btestablished = false;
         onbtdisconnected({name:btname,address:btaddress,nr:nrinfoundDevices});  
    }
    //-----------------------------------------------------------------------------
    function sincelastsend() {
        return Date.now() - lastsendms;
    }
    //-----------------------------------------------------------------------------
    function sendbt(txt) {
        // sending out on 2010
        var bytes = bluetoothle.stringToBytes(txt + "\r\n");
        var encodedString = bluetoothle.bytesToEncodedString(bytes);
        // sending on writechar
        var params = {
            address: btaddress,
            service: config.btservice,
            characteristic: config.sendchar,
            value: encodedString
        };
        bluetoothle.writeQ(function() {
            lastsendms = Date.now();

        }, handleError, params);
    }
    //-----------------------------------------------------------------------------
    function sendbtjson(obj) {
        //console.log("btsend "+JSON.stringify(obj));
        sendbt(JSON.stringify(obj));
    }
    //-----------------------------------------------------------------------------
    //-----------------------------------------------------------------------------
    // customize function what to do if line received
    function gotline(line, ch) { // characteristic
        if (line[0] == 'b') { // binary
            if (typeof onreceivedbinary === 'function') onreceivedbinary(line);
            return;
        }
        if (line[0] != '{') { // no json
            if (typeof ongotmsg === "function") ongotmsg(line, ch);
            return;
        }
        var jo = {};
        try {
            jo = JSON.parse(line);
        } catch (exc) {
            //consolelog(exc.message + " exc " + line + "|");
            console.log(exc.message + " exc " + line + "|");
            return;
        }
        //console.log("json: "+JSON.stringify(jo));
        ongotjson(jo, ch);
    }
    //-----------------------------------------------------------------------------
function getrssi() {
   let ret=new Promise(function(resolve,reject) {	    
        if (btconnected) {
            bluetoothle.rssi(function(res) {
                console.log("rssi " + res.rssi);
		    rssi=res.rssi;
		    resolve(res);
            }, function(e) { // used also to check connection 
                disconnect(); // we have to really disconnect
		 reject();   
            }, {
                address: btaddress
            });
        }
   });
   return ret;
    }
    //-----------------------------------------------------------------------------
    function testjsonfunc(e) {
        if (e.keyCode == 13) {
            var inp = e.target;
            var v = inp.value;
            console.log("fble.testfunc " + v);
            gotline(v, "testjson");
        }
    }
    function getfounddevices(){
    return foundDevices;
    }
    function getconnected(){
    if (!btconnected) return{};
     return({name:btname,address:btaddress,nr:nrinfoundDevices,service:config.btservice}); 
    }
    //--------------------------------------------------------------------------------
    function fillListBasedOnConnectionStatus() {
        var listElement = document.getElementById("deviceList");
      
        // Check if the device was previously connected
        bluetoothle.wasConnected(
          function(result) {
            // Result contains information about previously connected devices
            var devices = result.devices;
      
            // Iterate through the devices and add them to the list
            devices.forEach(function(device) {
              var listItem = document.createElement("li");
              listItem.textContent = device.name;
              listElement.appendChild(listItem);
            });
          },
          function(error) {
            console.log("Error occurred while checking connection status: " + error);
          }
        );
      }
      //-------------------------------------------------------------------------
      function getDeviceDetails() {
        if (!btconnected) {
          console.log("No device connected.");
          return;
        }
      
        var params = {
          address: btaddress
        };
      
        bluetoothle.services(function(result) {
          if (result.status === "services") {
            console.log("Device Services:");
            result.services.forEach(function(service) {
              console.log("Service UUID: " + service.uuid);
              // Retrieve characteristics for each service
              bluetoothle.characteristics(function(charResult) {
                if (charResult.status === "characteristics") {
                  console.log("Characteristics for Service: " + service.uuid);
                  charResult.characteristics.forEach(function(characteristic) {
                    console.log("  Characteristic UUID: " + characteristic.uuid);
                  });
                }
              }, handleError, {
                address: btaddress,
                service: service.uuid
              });
            });
          }
        }, handleError, params);
      }
//-------------------------------------------------------------------------------
// bleLocationCheck.js

function checkAdapters() {
    var isLocationEnabled = false;
    var isBluetoothEnabled = false;
  
    // Check if location is enabled for Android
    cordova.plugins.diagnostic.isLocationEnabled(function(locationEnabled) {
      console.log("Location enabled: " + locationEnabled);
      isLocationEnabled = locationEnabled;
      checkBluetoothEnabled();
    }, function(error) {
      console.log("Error occurred while checking location: " + error);
      checkBluetoothEnabled();
    });
  
    function checkBluetoothEnabled() {
      bluetoothle.isEnabled(function(result) {
        console.log("Bluetooth is " + JSON.stringify(result));
        isBluetoothEnabled = result.isEnabled;
        handleAdapterStatus(isLocationEnabled, isBluetoothEnabled);
      }, function(error) {
        console.log("Error occurred while checking Bluetooth: " + error);
        handleAdapterStatus(isLocationEnabled, isBluetoothEnabled);
      });
    }
  
    function handleAdapterStatus(isLocationEnabled, isBluetoothEnabled) {
      if (!isLocationEnabled) {
        alert("Please enable Location to start.");
      }
  
      if (!isBluetoothEnabled) {
        alert("Please enable Bluetooth to start.");
      }
  
      // Do additional processing or trigger events based on adapter status...
    }
  }
  
    
    //-----------------------------------------------------------------------------
    return {
        sendjson: sendbtjson,
        send: sendbt,
        ondevicefound: defondevicefound,
	founddevices : getfounddevices,    
	onsubscribed: defonsubscribed,
        ondisconnected: defdisconnect,
        ongotmsg: defongotmsg,
        ongotjson: defongotjson,
        onscanstop: defonscanstop,
	testjson: testjsonfunc,
        getrssi: getrssi,
        config: setconfig,
        disconnect: disconnect,
        readchar: btreadchar,
        isconnected: isconnected,
	getconnected: getconnected,    
        scan : startScan,
	connect : connect,    
	start: blestart,
	subscribe: subscribednew,
    wasconnected:fillListBasedOnConnectionStatus,
    getDeviceDetails:getDeviceDetails,
    checkAdapters:checkAdapters,
    setMTU:setMTU
    }
})();
