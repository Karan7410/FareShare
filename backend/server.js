const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const server = http.createServer(app); // Wrap Express in an HTTP server for Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Allows your React frontend to connect easily
    methods: ["GET", "POST", "PATCH"]
  }
});

const userSocketMap = new Map();

const prisma = new PrismaClient();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Store active user socket connections so we can message specific users
const activeUsers = new Map(); // userId -> socketId
let activeRides = [];

io.on('connection', (socket) => {
  console.log(`A user connected via WebSocket: ${socket.id}`);

  // When a user logs in or opens the app, they register their userId with their socket id
  socket.on('register_user', (userId) => {
    activeUsers.set(Number(userId), socket.id);
    console.log(`User ID ${userId} registered with socket ID ${socket.id}`);
  });
// 1. Co-Rider sends a join request to the Host
  socket.on('send_join_request', (data) => {
    const { hostUserId, rideId, coRiderId, coRiderName, pickupLoc, dropLoc, seatsNeeded, fareContribution } = data;
    console.log(`Join request from ${coRiderName} (User ${coRiderId}) for Host User ${hostUserId}`);

    const hostSocketId = activeUsers.get(Number(hostUserId));
    if (hostSocketId) {
      io.to(hostSocketId).emit('incoming_join_request', {
        requestId: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        rideId,
        coRiderId,
        riderName: coRiderName,
        pickupLoc,
        dropLoc,
        seatsNeeded: seatsNeeded || 1,
        fareContribution: fareContribution || 80,
        detour: "2 mins detour"
      });
    } else {
      console.log(`Host User ${hostUserId} is not connected.`);
    }
  });

  // 2. Host accepts or declines the incoming request
  socket.on('respond_join_request', (data) => {
    const { coRiderId, rideId, status, newFare } = data;
    console.log(`Host response: ${status} for Co-Rider ${coRiderId}`);

    const coRiderSocketId = activeUsers.get(Number(coRiderId));
    if (coRiderSocketId) {
      io.to(coRiderSocketId).emit('join_request_response', {
        status,
        rideId,
        newFare,
        message: status === 'ACCEPTED' ? 'Your join request was accepted!' : 'Host declined the request.'
      });
    }
  });
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Clean up map on disconnect
    for (let [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        break;
      }
    }
  });
});

// 1. Health check route
app.get('/api/test', (req, res) => {
  res.json({ message: "FareShare API is online and real-time sockets are active." });
});

// 2. User registration
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const newUser = await prisma.user.create({
      data: { name, email, role: role || "USER" }
    });
    res.json({ message: "User created successfully!", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user. Email may already exist." });
  }
});

// 3. Primary Rider: Create a ride
app.post('/api/rides', async (req, res) => {
  try {
    const { primaryRiderId, startLat, startLng, endLat, endLng, isFareShare, sharedSeats } = req.body;
    
const newRide = await prisma.ride.create({
  data: {
    primaryRiderId: Number(primaryRiderId) || 1,
    startLat: parseFloat(startLat) || 30.7333, 
    startLng: parseFloat(startLng) || 76.7794,
    endLat: parseFloat(endLat) || 30.7046,
    endLng: parseFloat(endLng) || 76.8013,
    isFareShare: Boolean(isFareShare),
    
    // FIX THESE TWO LINES:
    sharedSeats: sharedSeats ? Number(sharedSeats) : 2, // Default to 2 seats instead of 0
    status: "ACTIVE" // Change from PENDING to ACTIVE
  }
});
    res.json({ message: "Ride created successfully!", ride: newRide });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create ride." });
  }
});

// 4. Co-Rider: Fetch all active rides
app.get('/api/rides/active', async (req, res) => {
  try {
    const activeRides = await prisma.ride.findMany({
      where: {
        status: "ACTIVE",
        sharedSeats: { gt: 0 } // Must have more than 0 seats
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`[FETCH] Sent ${activeRides.length} active rides to Co-Rider.`);
    res.json(activeRides);
  } catch (error) {
    console.error("Error fetching active rides:", error);
    res.status(500).json({ error: "Failed to fetch active rides." });
  }
});

// 4. Secondary Rider: Send request to join an existing ride (Now with Real-Time Push!)
app.post('/api/rides/:rideId/join', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { secondaryRiderId, startLat, startLng, endLat, endLng } = req.body;

    const targetRide = await prisma.ride.findUnique({
      where: { id: Number(rideId) },
      include: { joinRequests: true, primaryRider: true }
    });

    if (!targetRide) {
      return res.status(404).json({ error: "Ride not found." });
    }

    if (!targetRide.isFareShare) {
      return res.status(400).json({ error: "This ride has FareShare disabled." });
    }

    const acceptedCount = targetRide.joinRequests.filter(r => r.status === "ACCEPTED").length;
    if (acceptedCount >= targetRide.sharedSeats) {
      return res.status(400).json({ error: "This ride is already at full sharing capacity." });
    }

    const newRequest = await prisma.joinRequest.create({
      data: {
        rideId: Number(rideId),
        secondaryRiderId,
        startLat,
        startLng,
        endLat,
        endLng,
        status: "PENDING"
      },
      include: { secondaryRider: true } // Pull secondary rider details for the notification
    });

    // 🔔 REAL-TIME PUSH: Find the primary rider's socket and send them an instant pop-up payload!
    const primarySocketId = activeUsers.get(targetRide.primaryRiderId);
    if (primarySocketId) {
      io.to(primarySocketId).emit('receive_join_request', {
        message: "A rider wants to join your trip!",
        requestId: newRequest.id,
        rideId: targetRide.id,
        secondaryRider: newRequest.secondaryRider,
        startLat: newRequest.startLat,
        startLng: newRequest.startLng,
        endLat: newRequest.endLat,
        endLng: newRequest.endLng
      });
      console.log(`Real-time pop-up pushed to Primary Rider ID ${targetRide.primaryRiderId}`);
    }

    res.json({ message: "Join request submitted and real-time alert dispatched!", request: newRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit join request." });
  }
});

// 5. Primary Rider: Accept or Reject a join request
app.patch('/api/requests/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // 'ACCEPTED' or 'REJECTED'

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: "Status must be either ACCEPTED or REJECTED." });
    }

    const updatedRequest = await prisma.joinRequest.update({
      where: { id: Number(requestId) },
      data: { status },
      include: { ride: true }
    });

    // 🔔 REAL-TIME PUSH: Notify the secondary rider that their request was accepted/rejected
    const secondarySocketId = activeUsers.get(updatedRequest.secondaryRiderId);
    if (secondarySocketId) {
      io.to(secondarySocketId).emit('request_status_updated', {
        status: updatedRequest.status,
        rideId: updatedRequest.rideId,
        message: `Your ride join request was ${updatedRequest.status.toLowerCase()}!`
      });
    }

    res.json({ message: `Request updated to ${status}!`, request: updatedRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update request status." });
  }
});

// 6. PostGIS Search Route
app.post('/api/rides/search', async (req, res) => {
  try {
    const { startLat, startLng, endLat, endLng, searchRadiusKm = 2 } = req.body;
    const radiusInMeters = searchRadiusKm * 1000;

    const matchingRides = await prisma.$queryRaw`
      SELECT 
        id, "primaryRiderId", "sharedSeats", "isFareShare", 
        "startLat", "startLng", "endLat", "endLng",
        (
          ST_DistanceSphere(
            ST_MakePoint("startLng", "startLat"),
            ST_MakePoint(${startLng}, ${startLat})
          )
        ) AS "pickupDistanceMeters",
        (
          ST_DistanceSphere(
            ST_MakePoint("endLng", "endLat"),
            ST_MakePoint(${endLng}, ${endLat})
          )
        ) AS "dropoffDistanceMeters"
      FROM "Ride"
      WHERE status = 'PENDING' 
        AND "isFareShare" = true
        AND ST_DistanceSphere(
              ST_MakePoint("startLng", "startLat"),
              ST_MakePoint(${startLng}, ${startLat})
            ) <= ${radiusInMeters}
        AND ST_DistanceSphere(
              ST_MakePoint("endLng", "endLat"),
              ST_MakePoint(${endLng}, ${endLat})
            ) <= ${radiusInMeters}
    `;

    const availableRides = [];
    for (const ride of matchingRides) {
      const acceptedRequests = await prisma.joinRequest.count({
        where: { rideId: ride.id, status: 'ACCEPTED' }
      });
      
      if (acceptedRequests < ride.sharedSeats) {
        availableRides.push(ride);
      }
    }

    res.json({ message: `Found ${availableRides.length} matching rides!`, rides: availableRides });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to search for overlapping rides." });
  }
});

// START THE HTTP SERVER (using `server.listen` instead of `app.listen`)
server.listen(PORT, () => {
  console.log(`Server and Socket.io engine running on http://localhost:${PORT}`);
});