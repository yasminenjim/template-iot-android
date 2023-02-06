
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {


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


// Get the scan button
var scanButton = document.getElementById("scanButton");

// Add an event listener to start a scan when the button is clicked
scanButton.addEventListener("click", function() {
  // Start a scan for nearby Bluetooth devices
  bluetooth.startScan(function(devices) {
    // Get the device list element
    var list = document.getElementById("deviceList");

    // Clear the current list of devices
    list.innerHTML = "";

    // Loop through the array of devices
    devices.forEach(function(device) {
      // Create a new list item for the device
      var item = document.createElement("li");
      item.innerHTML = device.name + " (" + device.address + ")";

      // Add the item to the list
      list.appendChild(item);
    });
  });
});

//**************************************************************** */
 
