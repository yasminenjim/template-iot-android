/*


ongotline with chariacteristic to make distinction  ?

if (fvar)  fvar.addfunc("sendbtjson", sendbtjson);   
-> if (fvar) fvar.addfunc("sendbtjson", fble.sendjson);
 

fvar.parse(jo); -> ongotjson(jo);   

*/

//you can change the parametres when you call fble function
fble = (function() {
    let config = {
        btservice: "",
        btpassword: "frenell",
        scandivid: "btscandiv",
        scanbtnid: "bt_scan",
        scandiscbtnid: "bt_disconnect",
        sendchar: "2010",
	readchar: "2001",   
        btnamefilter: ""
    }

    let foundDevices = [];
    let btconnected = false;
    let btestablished = false;
    let btctr = 0;
    let b_accesgranted = false;
    let btaddress = "";
    var b_scanning = false;
    var lastsendms = Date.now();
    let onbtsubscribed = function() {};
    let onbtdisconnected = function() {};

    let onreceivedbinary = function() {};
    let ongotmsg = function() {};
    let ongotjson = function() {};


    console.log("lastsendms " + lastsendms);

    function setconfig(obj) {
        console.log("setconfig " + JSON.stringify(obj));
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

        document.getElementById(config.scanbtnid).addEventListener("click", startScan, false);
        document.getElementById(config.scandiscbtnid).addEventListener("click", disconnect, false);


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
    function defonsubscribed(f) {
        if (typeof f != "function") {
            alert("onbtsubscribed");
            return;
        }
        onbtsubscribed = f;
    }
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
            setTimeout(function() {
                startScan();
            }, 500);
        } else {
            document.getElementById("bt_scan").disabled = true;
            alert("Bluetooth is not enabled:");
        }
    }
    //-----------------------------------------------------------------------------
    function startScan() {
        if (config.btservice === "") {
            alert("no btservice defined");
            return;
        }
        console.log("scanning...");
        foundDevices = [];

        document.getElementById("btscandiv").innerHTML = "";
        //    if (window.cordova.platformId === "windows") {
        //        bluetoothle.retrieveConnected(retrieveConnectedSuccess, handleError, {});
        //    }
        if (window.cordova.platformId === "android" || window.cordova.platformId === "ios") {
            bluetoothle.startScan(startScanSuccess, function(e) {
                console.log("startscanerror ");
                b_scanning = false;
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
        }, handleError);
    }
    //-----------------------------------------------------------------------------
    function startScanSuccess(result) {
        console.log("startScanSuccess " + result.status);
        if (result.status === "scanStarted") {
            foundtime = "";
            b_scanning = true;
        } else if (result.status === "scanResult") {
            if (foundtime != "") {
                var d = new Date;
                var difftime = (d.getTime() - foundtime.getTime()) / 1000.;
                if (difftime > 0.6) mystopscan(); //stop 0.6 sec after found  
            }

            if (!foundDevices.some(function(device) {

                    return device.address === result.address;

                })) {

                foundtime = new Date;
                console.log('FOUND DEVICE: ' + result.address);
                foundDevices.push(result);
                addDevice(result, foundDevices.length - 1);
            }
        }
    }
    //-----------------------------------------------------------------------------
    function addDevice(o, nr) {
        console.log("addDevice " + o.name + " " + nr);
        
	if (config.btnamefilter !="") {
		if (o.name.indexOf(config.btnamefilter)!=0) {
			   return;
			                             }
		               }

        var button = document.createElement("button");
        var btid = "id_" + o.name + "_" + nr;
        button.setAttribute("id", btid);
        button.className = "btnametable";

        button.textContent = o.name + "   rssi " + o.rssi; // + ": " + address;
        button.addEventListener("click", function(e) {

            if (btconnected) {
                alert("disconnect first");
                return;
            }
            btaddress = o.address;
            connect(o.address, e.target.id);
        });

        document.getElementById("btscandiv").appendChild(button);
    }
    //-----------------------------------------------------------------------------
    function connect(address, btid) {
        btbuttonid = btid;
        if (cordova.platformId === "windows") {
            getDeviceServices(address);
        } else {
            if (b_scanning) mystopscan();

            new Promise(function(resolve, reject) {
                bluetoothle.connect(resolve, reject, {
                    address: address
                });
            }).then(connectSuccess, handleError);

        }
    }
    //-----------------------------------------------------------------------------
    function connectSuccess(result) {
        console.log("connectedSuccess " + result.status);
        if (result.status === "connected") {
            console.log("connected " + JSON.stringify(result));
           // tactile();
            btconnected = true;
            document.getElementById(btbuttonid).style.background = "whitesmoke";
            btname = result.name;
            if (cordova.platformId === "android") {
                console.log("set MTU");
                //set mtu
                var params = {
                    address: result.address,
                    mtu: 92
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
            btconnected = false;
            onbtdisconnected(); //send name?    
            // change 
            //document.getElementById("btbtn").style.background = "green"; 
			console.log("could not connect");
			
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
            "characteristic": config.readchar
        };
        console.log("subscribe to " + params.characteristic);
        bluetoothle.subscribe(function(result) {
            if (result.status === "subscribedResult") {
                btctr++;
                //console.log("subscribedResult "+JSON.stringify(result)); 
                var v = window.atob(result.value);
                gotline(v, result.characteristic); // coming from writecharacteristic 2001 
                return;
            }

            if (result.status === "subscribed") {
                atsubscribed();
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
            onbtsubscribed();
            sendbtjson({
                "start": {
                    "msg": "hallo"
                }
            });
        }, 200);

    }
    //-----------------------------------------------------------------------------

    bluetoothle.startStateNotifications(
        function(state) {
            console.log("Bluetooth is " + state);
            console.log("showing bluetooth state");
        }
    );
    //-----------------------------------------------------------------------------
    function handleError(error) {
        if (typeof(error) === 'object') {
            var e = String(error.error);
            console.log("error " + e + " ");
            if (e.indexOf("isDisconnected") == 0 || e.indexOf("isNotC") == 0) {
                onbtdisconnected();
                return;
            }
            console.log("error " + JSON.stringify(error));

        } else {
            console.log("error " + error);
        }
    }
    //-----------------------------------------------------------------------------
    function disconnect() {
        console.log("disconnecting<BR>");
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
        alert("bt disconnected");
        btconnected = false;
        btestablished = false;
        var b = document.getElementById(btbuttonid);
        if (b) b.style.background = "gray";
        //document.getElementById("cbtname")="not connected";
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
        if (btconnected) {
            bluetoothle.rssi(function(res) {
                console.log("rssi " + res.rssi);
                var e = document.getElementById("rssivalue");
                if (e) e.innerHTML = res.rssi;
                //document.getElementById("d_btconnected").innerHTML="BT connected rssi "+res.rssi;                           
            }, function(e) {
                disconnect(); // we have to really disconnect                                                                
            }, {
                address: btaddress
            });
        }

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
    //-----------------------------------------------------------------------------
	
	
	
	
	
	
	//-----------------------------------------------------------------------------
    return {
        sendjson: sendbtjson,
        send: sendbt,
        onsubscribed: defonsubscribed,
        ondisconnected: defdisconnect,
        ongotmsg: defongotmsg,
        ongotjson: defongotjson,
        testjson: testjsonfunc,
        getrssi: getrssi,
        config: setconfig,
        disconnect: disconnect,
        readchar: btreadchar,
        isconnected: isconnected,
        start: blestart
    }
})();
