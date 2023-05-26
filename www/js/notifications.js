function addNotification(message) {
    // Check if the notification with the same message already exists
    var existingNotification = notifications.find(function(notification) {
      return notification === message;
    });
  
    // If the notification already exists, don't add it again
    if (existingNotification) {
      return;
    }
  
    // Create a new notification item
    var notificationItem = document.createElement("div");
    notificationItem.className = "notification-item";
    notificationItem.innerText = message;
  
    // Add the notification item to the list container
    var notificationList = document.getElementById("notification-list");
    notificationList.appendChild(notificationItem);
  
    // Store the notification data
    notifications.push(message);
  
    // Attach a click event listener to the notification item
    notificationItem.addEventListener("click", function() {
      navigateToPage("canInterfaces.html"); // Navigate to canInterfaces.html upon clicking the notification
    });
  }
  