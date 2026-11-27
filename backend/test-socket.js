const { io } = require("socket.io-client");

// Connect to your local backend socket server
const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to WebSocket server with ID:", socket.id);

  // Simulate Primary Rider (User ID: 1) registering their session
  const primaryRiderId = 1;
  socket.emit("register_user", primaryRiderId);
  console.log(`Registered User ID ${primaryRiderId} with the socket server.`);
});

// Listen for the live join request pop-up event we coded in server.js
socket.on("receive_join_request", (data) => {
  console.log("\n🔔 [REAL-TIME POP-UP RECEIVED BY PRIMARY RIDER]:");
  console.log(data);
});

socket.on("disconnect", () => {
  console.log("Disconnected from WebSocket server.");
});