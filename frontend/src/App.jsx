import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import './App.css';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const CHANDIGARH_PLACES = [
  // --- CHANDIGARH CORE SECTORS & MARKETS ---
  { name: "Sector 1, Chandigarh (Capitol Complex)", lat: 30.7592, lng: 76.8058 },
  { name: "Sector 2, Chandigarh", lat: 30.7550, lng: 76.7950 },
  { name: "Sector 3, Chandigarh (War Memorial)", lat: 30.7520, lng: 76.7900 },
  { name: "Sector 4, Chandigarh", lat: 30.7490, lng: 76.7860 },
  { name: "Sector 5, Chandigarh", lat: 30.7460, lng: 76.7930 },
  { name: "Sector 7, Chandigarh Market", lat: 30.7420, lng: 76.7880 },
  { name: "Sector 8, Inner Market & Cafes", lat: 30.7450, lng: 76.7850 },
  { name: "Sector 9, Inner Market & Food Street", lat: 30.7430, lng: 76.7910 },
  { name: "Sector 10, Art Gallery & Gedi Route", lat: 30.7510, lng: 76.7830 },
  { name: "Sector 11, Market & Goli Vada Pav", lat: 30.7540, lng: 76.7750 },
  { name: "Sector 15, Student Market & Patel Market", lat: 30.7580, lng: 76.7600 },
  { name: "Sector 16, Cricket Stadium & Rose Garden", lat: 30.7440, lng: 76.7690 },
  { name: "Sector 17, City Centre & Plaza", lat: 30.7333, lng: 76.7794 },
  { name: "Sector 18, Electronics Market", lat: 30.7350, lng: 76.7870 },
  { name: "Sector 19, Sadar Bazaar & Palika Bazaar", lat: 30.7250, lng: 76.7850 },
  { name: "Sector 20, Market & Masjid Ground", lat: 30.7200, lng: 76.7880 },
  { name: "Sector 21, Market", lat: 30.7280, lng: 76.7810 },
  { name: "Sector 22, Shastri Market & Aroma Chowk", lat: 30.7290, lng: 76.7725 },
  { name: "Sector 23, Market & Children Traffic Park", lat: 30.7380, lng: 76.7680 },
  { name: "Sector 24, Market", lat: 30.7400, lng: 76.7610 },
  { name: "Sector 26, Grain Market & Club Street", lat: 30.7220, lng: 76.8050 },
  { name: "Sector 27, Market", lat: 30.7180, lng: 76.7900 },
  { name: "Sector 28, Motor Market", lat: 30.7150, lng: 76.7950 },
  { name: "Sector 29, Market & Iron Market", lat: 30.7090, lng: 76.7900 },
  { name: "Sector 30, Market", lat: 30.7050, lng: 76.7850 },
  { name: "Sector 31, Market & Air Force Station Gate", lat: 30.7000, lng: 76.7900 },
  { name: "Sector 32, Market & SD College", lat: 30.7110, lng: 76.7730 },
  { name: "Sector 33, Market & Terraced Garden", lat: 30.7150, lng: 76.7700 },
  { name: "Sector 34, Exhibition Ground & Coaching Hub", lat: 30.7180, lng: 76.7600 },
  { name: "Sector 35, Market & Hotel JW Marriott", lat: 30.7185, lng: 76.7650 },
  { name: "Sector 36, Market & Fragrance Garden", lat: 30.7250, lng: 76.7550 },
  { name: "Sector 37, Market", lat: 30.7200, lng: 76.7480 },
  { name: "Sector 38, Market", lat: 30.7230, lng: 76.7400 },
  { name: "Sector 38 West, Market", lat: 30.7300, lng: 76.7320 },
  { name: "Sector 39, Grain Market & Waterworks", lat: 30.7280, lng: 76.7320 },
  { name: "Sector 40, Market", lat: 30.7350, lng: 76.7380 },
  { name: "Sector 41, Krishna Market", lat: 30.7380, lng: 76.7450 },
  { name: "Sector 42, Lake & Sports Complex", lat: 30.7301, lng: 76.7350 },
  { name: "Sector 43, Market & District Courts", lat: 30.7220, lng: 76.7430 },
  { name: "Sector 44, Market", lat: 30.7150, lng: 76.7450 },
  { name: "Sector 45, Burail Market", lat: 30.7100, lng: 76.7550 },
  { name: "Sector 46, Market & Sanatan Dharm Temple", lat: 30.7050, lng: 76.7500 },
  { name: "Sector 47, Market", lat: 30.7000, lng: 76.7550 },
  { name: "Sector 48, Motor Market & Societies", lat: 30.6950, lng: 76.7600 },
  { name: "Sector 49, Pushpac Complex", lat: 30.6920, lng: 76.7550 },
  { name: "Sector 50, Progressive Society", lat: 30.6890, lng: 76.7500 },
  { name: "Sector 51, Housing Board & Model Jail", lat: 30.6850, lng: 76.7450 },
  { name: "Sector 52, Kajheri", lat: 30.7120, lng: 76.7320 },
  { name: "Sector 53, Chandigarh Barrier", lat: 30.7080, lng: 76.7280 },
  { name: "Sector 55, Palsora", lat: 30.7200, lng: 76.7200 },
  { name: "Sector 56, Rehri Market", lat: 30.7260, lng: 76.7160 },

  // --- TRANSIT & HUBS ---
  { name: "Shaheed Bhagat Singh International Airport (IXC)", lat: 30.6735, lng: 76.7885 },
  { name: "Chandigarh International Airport Terminal 2", lat: 30.6690, lng: 76.7850 },
  { name: "ISBT Sector 17 Bus Stand", lat: 30.7310, lng: 76.7720 },
  { name: "ISBT Sector 43 Bus Stand", lat: 30.7231, lng: 76.7397 },
  { name: "Chandigarh Railway Station (Panchkula Side)", lat: 30.7115, lng: 76.8180 },
  { name: "Chandigarh Railway Station (Chandigarh Side)", lat: 30.7099, lng: 76.8123 },
  { name: "Tribune Chowk, Chandigarh", lat: 30.7080, lng: 76.7950 },
  { name: "Transport Chowk, Sector 26", lat: 30.7240, lng: 76.8080 },
  { name: "Piccadily Chowk, Sector 22/35", lat: 30.7250, lng: 76.7680 },
  { name: "Kisan Bhawan Chowk, Sector 35", lat: 30.7190, lng: 76.7590 },
  { name: "Matka Chowk, Sector 17/16", lat: 30.7390, lng: 76.7750 },
  { name: "Housing Board Chowk, Manimajra", lat: 30.7150, lng: 76.8400 },

  // --- INDUSTRIAL & TECH ---
  { name: "Elante Mall, Industrial Area Phase 1", lat: 30.7046, lng: 76.7978 },
  { name: "Industrial Area Phase 2, Chandigarh", lat: 30.6970, lng: 76.8020 },
  { name: "Chandigarh IT Park, DLF Building", lat: 30.7250, lng: 76.8340 },
  { name: "Chandigarh IT Park, Infosys Campus", lat: 30.7280, lng: 76.8410 },
  { name: "Kishangarh, IT Park Road", lat: 30.7310, lng: 76.8250 },
  { name: "Manimajra Main Market", lat: 30.7210, lng: 76.8450 },

  // --- HOSPITALS & EDUCATION ---
  { name: "PGI Hospital, Sector 12", lat: 30.7659, lng: 76.7773 },
  { name: "GMCH Sector 32 Hospital", lat: 30.7100, lng: 76.7750 },
  { name: "GMSH Sector 16 Hospital", lat: 30.7470, lng: 76.7680 },
  { name: "Panjab University (PU) Gate 1, Sector 14", lat: 30.7600, lng: 76.7710 },
  { name: "Panjab University (PU) South Campus, Sector 25", lat: 30.7480, lng: 76.7530 },
  { name: "PEC University of Technology, Sector 12", lat: 30.7640, lng: 76.7800 },
  { name: "NIPER, Sector 67", lat: 30.6800, lng: 76.7300 },
  { name: "IISER Mohali, Sector 81", lat: 30.6550, lng: 76.7270 },
  { name: "Chandigarh University (CU), Gharuan", lat: 30.7700, lng: 76.5760 },

  // --- KHARAR & GREATER MOHALI ---
  { name: "Kharar Bus Stand", lat: 30.7450, lng: 76.6480 },
  { name: "Kharar Main Market & Civil Hospital", lat: 30.7420, lng: 76.6430 },
  { name: "Sunny Enclave, Kharar", lat: 30.7480, lng: 76.6780 },
  { name: "VR Punjab Mall (North Country Mall), Kharar", lat: 30.7430, lng: 76.6890 },
  { name: "Omega City, Kharar Highway", lat: 30.7470, lng: 76.6350 },
  { name: "Kharar-Landran Road, Sector 115", lat: 30.7280, lng: 76.6570 },
  { name: "Landran Chowk & CGC Landran Campus", lat: 30.6940, lng: 76.6650 },
  { name: "Kurali Bypass / Kharar Toll", lat: 30.7700, lng: 76.6200 },
  { name: "Gillco Valley, Kharar", lat: 30.7510, lng: 76.6670 },
  { name: "Nirwana Square, Kharar", lat: 30.7520, lng: 76.6550 },

  // --- ZIRAKPUR & VIP ROAD ---
  { name: "Zirakpur Flyover Chowk", lat: 30.6425, lng: 76.8173 },
  { name: "VIP Road, Zirakpur (High Street)", lat: 30.6380, lng: 76.8180 },
  { name: "Patiala Road, Zirakpur", lat: 30.6350, lng: 76.8090 },
  { name: "Ambala-Chandigarh Expressway, Zirakpur", lat: 30.6300, lng: 76.8250 },
  { name: "Dhakoli, Zirakpur", lat: 30.6500, lng: 76.8450 },
  { name: "Baltana Main Market, Zirakpur", lat: 30.6650, lng: 76.8320 },
  { name: "Peermuchalla, Zirakpur", lat: 30.6530, lng: 76.8600 },
  { name: "Cosmo Mall, Zirakpur", lat: 30.6340, lng: 76.8280 },
  { name: "Metro Cash & Carry, Zirakpur", lat: 30.6310, lng: 76.8310 },
  { name: "Decathlon Zirakpur", lat: 30.6270, lng: 76.8340 },

  // --- MOHALI (SAS NAGAR) SECTORS & LANDMARKS ---
  { name: "Sector 55, Mohali (Phase 1)", lat: 30.7280, lng: 76.7190 },
  { name: "Phase 2 Market, Mohali", lat: 30.7220, lng: 76.7180 },
  { name: "Phase 3B2 Market, Mohali (Food Hub)", lat: 30.7125, lng: 76.7150 },
  { name: "Phase 5 Market, Mohali", lat: 30.7100, lng: 76.7200 },
  { name: "Phase 7 Market, Mohali", lat: 30.7020, lng: 76.7170 },
  { name: "Sector 62, Mohali (Phase 8)", lat: 30.6960, lng: 76.7250 },
  { name: "Fortis Hospital, Sector 62 Mohali", lat: 30.6930, lng: 76.7290 },
  { name: "PCA Cricket Stadium, Sector 63 Mohali", lat: 30.6910, lng: 76.7370 },
  { name: "Phase 9 Market, Mohali", lat: 30.6870, lng: 76.7260 },
  { name: "Phase 10 Market, Mohali", lat: 30.6820, lng: 76.7220 },
  { name: "Phase 11 Market, Mohali", lat: 30.6750, lng: 76.7210 },
  { name: "Sector 67, Mohali (CP67 Mall)", lat: 30.6860, lng: 76.7360 },
  { name: "Sector 68, Mohali (Kumbra)", lat: 30.6890, lng: 76.7120 },
  { name: "Sector 70, Mohali Market (Matour)", lat: 30.7000, lng: 76.7050 },
  { name: "Sector 71, Mohali", lat: 30.7070, lng: 76.7010 },
  { name: "Sector 76, Mohali Judicial Courts", lat: 30.6800, lng: 76.6990 },
  { name: "Sector 79, Mohali Commercial Center", lat: 30.6720, lng: 76.7080 },
  { name: "Sector 82, Mohali JLPL Industrial Area", lat: 30.6580, lng: 76.7380 },
  { name: "Aerocity, Mohali (Airport Road)", lat: 30.6480, lng: 76.7620 },
  { name: "IT City, Sector 83 Alpha, Mohali", lat: 30.6410, lng: 76.7450 },

  // --- PANCHKULA CORE SECTORS & LANDMARKS ---
  { name: "Sector 5, Panchkula (MDC & Town Park)", lat: 30.6970, lng: 76.8520 },
  { name: "Sector 7, Panchkula Market", lat: 30.6920, lng: 76.8500 },
  { name: "Sector 8, Panchkula Food Street", lat: 30.6900, lng: 76.8560 },
  { name: "Sector 9, Panchkula Market", lat: 30.6860, lng: 76.8530 },
  { name: "Sector 11, Panchkula Market", lat: 30.6820, lng: 76.8590 },
  { name: "Sector 14, Panchkula (Govt PG College)", lat: 30.6780, lng: 76.8510 },
  { name: "Sector 15, Panchkula Market", lat: 30.6810, lng: 76.8450 },
  { name: "Sector 20, Panchkula Societies", lat: 30.6650, lng: 76.8550 },
  { name: "Mansa Devi Complex (MDC) Sector 4", lat: 30.7120, lng: 76.8480 },
  { name: "Mata Mansa Devi Temple, Panchkula", lat: 30.7250, lng: 76.8580 },
  { name: "Pinjore Garden (Yadavindra Gardens)", lat: 30.7950, lng: 76.9150 },
  { name: "Nada Sahib Gurudwara, Panchkula", lat: 30.6870, lng: 76.8850 },
  { name: "Bella Vista Mall, Sector 5 Panchkula", lat: 30.6980, lng: 76.8550 },
  { name: "Industrial Area Phase 1, Panchkula", lat: 30.6720, lng: 76.8420 },
  { name: "Industrial Area Phase 2, Panchkula", lat: 30.6650, lng: 76.8480 }
];

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function SetMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);
  return null;
}

function ClickEventsHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

function App() {
  // Role switcher: allows testing Host (Karan, ID: 1) and Co-Rider (Peer, ID: 2) in separate tabs
  const [userRole, setUserRole] = useState("HOST"); // "HOST" or "CORIDER"
  const currentUser = userRole === "HOST" ? { id: 1, name: "Karan (Host)" } : { id: 2, name: "Co-Rider (Peer)" };

  const [step, setStep] = useState(1);
  const [socket, setSocket] = useState(null);
  const [mapTargetType, setMapTargetType] = useState('start');

  // Route & Pin Locations
  const [startQuery, setStartQuery] = useState("Sector 17, City Centre & Plaza");
  const [endQuery, setEndQuery] = useState("Elante Mall, Industrial Area Phase 1");
  const [startLat, setStartLat] = useState(30.7333);
  const [startLng, setStartLng] = useState(76.7794);
  const [endLat, setEndLat] = useState(30.7046);
  const [endLng, setEndLng] = useState(76.7978);
  const [mapCenter, setMapCenter] = useState([30.7333, 76.7794]);

  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);

  // Host Ride Settings
  const [isFareShare, setIsFareShare] = useState(true);
  const [sharedSeatsToOffer, setSharedSeatsToOffer] = useState(2);
  const [selectedVehicle, setSelectedVehicle] = useState("mini");
  const [distanceKm, setDistanceKm] = useState(0);

  // Active Trip State (Host)
  const [activeRide, setActiveRide] = useState(null);
  const [acceptedRiders, setAcceptedRiders] = useState([]);
  const [incomingRequest, setIncomingRequest] = useState(null);

  // Co-Rider States
  const [availableRides, setAvailableRides] = useState([]);
  const [coRiderStatus, setCoRiderStatus] = useState("IDLE"); // IDLE, REQUESTING, ACCEPTED, DECLINED

  // Setup Socket Connection
  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("register_user", currentUser.id);
    });

    // Event: Host receives in-transit request from a real co-rider
    newSocket.on("incoming_join_request", (data) => {
      setIncomingRequest(data);
    });

    // Event: Co-Rider receives host's decision
    newSocket.on("join_request_response", (data) => {
      if (data.status === "ACCEPTED") {
        setCoRiderStatus("ACCEPTED");
      } else {
        setCoRiderStatus("DECLINED");
      }
    });

    return () => newSocket.close();
  }, [currentUser.id]);

  // Fetch active rides from the database and update the UI
  useEffect(() => {
    const fetchActiveRides = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/rides/active');
        const data = await response.json();
        
        // Put the database data into your React screen
        setAvailableRides(data);
        console.log("Loaded rides into state:", data);
      } catch (error) {
        console.error("Failed to fetch active rides:", error);
      }
    };

    fetchActiveRides();
  }, []);

  // Handle Map Clicks
  const handleMapClick = (lat, lng) => {
    const pinText = `Pinned (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    if (mapTargetType === 'start') {
      setStartLat(lat);
      setStartLng(lng);
      setStartQuery(pinText);
      setStartSuggestions([]);
    } else {
      setEndLat(lat);
      setEndLng(lng);
      setEndQuery(pinText);
      setEndSuggestions([]);
    }
    setMapCenter([lat, lng]);
  };

  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setStartLat(lat);
        setStartLng(lng);
        setStartQuery(`GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        setMapCenter([lat, lng]);
        setStartSuggestions([]);
      },
      () => alert("Unable to access live GPS location.")
    );
  };

  const handleInputChange = (text, type) => {
    if (type === 'start') {
      setStartQuery(text);
      setStartSuggestions(
        text.trim().length > 0 ? CHANDIGARH_PLACES.filter((p) => p.name.toLowerCase().includes(text.toLowerCase())) : []
      );
    } else {
      setEndQuery(text);
      setEndSuggestions(
        text.trim().length > 0 ? CHANDIGARH_PLACES.filter((p) => p.name.toLowerCase().includes(text.toLowerCase())) : []
      );
    }
  };

  const handleSelectPlace = (place, type) => {
    if (type === 'start') {
      setStartQuery(place.name);
      setStartLat(place.lat);
      setStartLng(place.lng);
      setMapCenter([place.lat, place.lng]);
      setStartSuggestions([]);
    } else {
      setEndQuery(place.name);
      setEndLat(place.lat);
      setEndLng(place.lng);
      setMapCenter([place.lat, place.lng]);
      setEndSuggestions([]);
    }
  };

  const handleProceedToVehicles = (e) => {
    e.preventDefault();
    const dist = calculateDistance(startLat, startLng, endLat, endLng);
    setDistanceKm(dist < 1 ? 1.5 : dist);
    setStep(2);
  };

  const getBaseFare = (ratePerKm) => {
    const raw = distanceKm * ratePerKm;
    return Math.round(raw < 50 ? 50 : raw);
  };

  // Host Books Full Ride
  const handleConfirmRide = async () => {
    setStep(3);
    const baseFare = selectedVehicle === 'moto' ? getBaseFare(15) : selectedVehicle === 'mini' ? getBaseFare(24) : getBaseFare(36);

    const generatedRideId = "FS-" + Math.floor(1000 + Math.random() * 9000);
   const ridePayload = {
    rideId: generatedRideId,
    primaryRiderId: currentUser.id,
    driverName: "Gurpreet Singh (Swift Dzire - PB65 AB 4589)",
    totalFare: baseFare,
    fare: baseFare, // Added for the database
    myCurrentShare: baseFare,
    vehicle: selectedVehicle?.toUpperCase() || 'MINI',
    isFareShare,
    sharedSeats: isFareShare ? sharedSeatsToOffer : 0, // Added for the database
    offeredSeats: isFareShare ? sharedSeatsToOffer : 0,
    remainingSeats: isFareShare ? sharedSeatsToOffer : 0,
    startLat: startLat, // Passing real GPS coords to DB
    startLng: startLng, 
    endLat: endLat,     
    endLng: endLng,     
    startLabel: startQuery,
    endLabel: endQuery
  };

    try {
      await fetch('http://localhost:5000/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ridePayload)
      });
    } catch (err) {
      console.log("Trip booked locally/online:", err);
    }

    // Cab dispatch animation -> Active Trip
    setTimeout(() => {
      setActiveRide(ridePayload);
      setStep(4);
    }, 2000);
  };

  // Host Accepts Co-Rider via Real Sockets
  const handleAcceptCoRider = () => {
    if (!incomingRequest || !activeRide) return;

    const updatedAccepted = [...acceptedRiders, incomingRequest];
    setAcceptedRiders(updatedAccepted);

    const discountFactor = updatedAccepted.length === 1 ? 0.65 : 0.50;
    const newMyShare = Math.round(activeRide.totalFare * discountFactor);

    setActiveRide((prev) => ({
      ...prev,
      myCurrentShare: newMyShare,
      remainingSeats: Math.max(0, prev.remainingSeats - incomingRequest.seatsNeeded)
    }));

    if (socket) {
      socket.emit("respond_join_request", {
        rideId: activeRide.rideId,
        coRiderId: incomingRequest.coRiderId,
        status: "ACCEPTED",
        newFare: newMyShare
      });
    }

    setIncomingRequest(null);
  };

  // Host Declines Co-Rider via Real Sockets
  const handleDeclineCoRider = () => {
    if (socket && incomingRequest) {
      socket.emit("respond_join_request", {
        rideId: activeRide.rideId,
        coRiderId: incomingRequest.coRiderId,
        status: "DECLINED"
      });
    }
    setIncomingRequest(null);
  };

  // Co-Rider: Query active host rides from backend
  const fetchActiveRides = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/rides/active');
      const data = await res.json();
      if (data.rides) {
        setAvailableRides(data.rides);
      }
    } catch (err) {
      console.log("Error loading active rides:", err);
    }
  };

  // Co-Rider sends join request to Host
  const handleSendJoinRequest = (targetRide) => {
    if (!socket) return;
    setCoRiderStatus("REQUESTING");

    socket.emit("send_join_request", {
      hostUserId: targetRide.primaryRiderId,
      rideId: targetRide.rideId,
      coRiderId: currentUser.id,
      coRiderName: currentUser.name,
      pickupLoc: "Aroma Chowk, Sector 22",
      dropLoc: "Elante Mall Phase 1",
      seatsNeeded: 1,
      fareContribution: Math.round(targetRide.totalFare * 0.35)
    });
  };

  return (
    <div style={{ maxWidth: '460px', margin: '20px auto', fontFamily: 'Inter, sans-serif', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      
      {/* Top Bar with Role Switcher */}
      <div style={{ background: '#000', color: '#fff', padding: '14px 18px', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Fare<span style={{ color: '#28a745' }}>Share</span></h2>
          <span style={{ fontSize: '11px', color: '#aaa' }}>{currentUser.name}</span>
        </div>
        
        {/* Toggle between Host & Co-Rider for multi-client testing */}
        <div style={{ display: 'flex', gap: '4px', background: '#222', padding: '3px', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => { setUserRole("HOST"); setStep(1); }}
            style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: userRole === 'HOST' ? '#28a745' : 'transparent', color: '#fff' }}>
            Host Tab
          </button>
          <button
            type="button"
            onClick={() => { setUserRole("CORIDER"); fetchActiveRides(); }}
            style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: userRole === 'CORIDER' ? '#007BFF' : 'transparent', color: '#fff' }}>
            Co-Rider Tab
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CO-RIDER VIEW (USER 2: DISCOVER & REQUEST JOIN)                          */}
      {/* ========================================================================= */}
      {userRole === "CORIDER" && (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Cabs Cruising Along Your Route</h3>
            <button onClick={fetchActiveRides} style={{ background: '#eee', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>🔄 Refresh</button>
          </div>

          {coRiderStatus === "IDLE" && (
            <div>
              {availableRides.length === 0 ? (
                <div style={{ padding: '30px 15px', textAlign: 'center', color: '#666', background: '#fafafa', borderRadius: '8px', border: '1px dashed #ccc' }}>
                  <p style={{ margin: '0 0 6px 0', fontWeight: 'bold' }}>No Active FareShare Cabs Found</p>
                  <p style={{ margin: 0, fontSize: '12px' }}>Open this app as "Host" in another tab/window, book a ride with FareShare enabled, then hit Refresh here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {availableRides.map((ride, idx) => (
                    <div key={idx} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '14px', background: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <strong style={{ fontSize: '14px' }}>Host ID: {ride.primaryRiderId}</strong>
<span style={{ fontSize: '11px', background: '#e2f0d9', color: '#28a745', padding: '2px 6px', borderRadius: '4px' }}>
  {ride.sharedSeats} Seats Left
</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#555', margin: '6px 0' }}>
                       🟢 Start: {ride.startLat.toFixed(4)}, {ride.startLng.toFixed(4)} <br />
  🔴 End: {ride.endLat.toFixed(4)}, {ride.endLng.toFixed(4)}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                       <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#000' }}>
  Fare: ₹{ride.fare}
</span>
                        <button
                          onClick={() => handleSendJoinRequest(ride)}
                          style={{ padding: '8px 14px', background: '#007BFF', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                          Request to Join (+1)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {coRiderStatus === "REQUESTING" && (
            <div style={{ padding: '30px 10px', textAlign: 'center' }}>
              <div style={{ width: '45px', height: '45px', border: '4px solid #eee', borderTop: '4px solid #007BFF', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 15px auto' }}></div>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <h4>Sending Request to Host...</h4>
              <p style={{ fontSize: '12px', color: '#666' }}>Waiting for the host in the other tab to accept your pickup request.</p>
            </div>
          )}

          {coRiderStatus === "ACCEPTED" && (
            <div style={{ padding: '30px 15px', textAlign: 'center', background: '#e2f0d9', borderRadius: '8px', border: '1px solid #28a745' }}>
              <h3 style={{ color: '#28a745', margin: '0 0 6px 0' }}>🎉 You're In!</h3>
              <p style={{ fontSize: '13px', color: '#333' }}>The host accepted your join request. Cab is routing to your pickup!</p>
              <button onClick={() => setCoRiderStatus("IDLE")} style={{ marginTop: '10px', padding: '8px 16px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                Done
              </button>
            </div>
          )}

          {coRiderStatus === "DECLINED" && (
            <div style={{ padding: '30px 15px', textAlign: 'center', background: '#f8d7da', borderRadius: '8px', border: '1px solid #dc3545' }}>
              <h3 style={{ color: '#dc3545', margin: '0 0 6px 0' }}>Request Declined</h3>
              <p style={{ fontSize: '13px', color: '#555' }}>The host opted not to take co-riders for this leg.</p>
              <button onClick={() => setCoRiderStatus("IDLE")} style={{ marginTop: '10px', padding: '8px 16px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                Try Another Ride
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* HOST VIEW (USER 1: ROUTE, PRICING, & IN-TRIP DASHBOARD)                  */}
      {/* ========================================================================= */}
      {userRole === "HOST" && (
        <>
          {step === 1 && (
            <div style={{ padding: '20px' }}>
              <h3>Where are you going?</h3>
              <form onSubmit={handleProceedToVehicles} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>PICKUP 🟢</label>
                    <button type="button" onClick={handleUseLiveLocation} style={{ background: 'none', border: 'none', color: '#007BFF', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                      📍 Current GPS
                    </button>
                  </div>
                  <input
                    type="text"
                    value={startQuery}
                    onFocus={() => setMapTargetType('start')}
                    onChange={(e) => handleInputChange(e.target.value, 'start')}
                    placeholder="Search pickup point..."
                    style={{ width: '100%', padding: '12px', fontSize: '13px', borderRadius: '8px', border: mapTargetType === 'start' ? '2px solid #007BFF' : '1px solid #ddd', boxSizing: 'border-box' }}
                    required
                  />
                  {startSuggestions.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 8px 16px rgba(0,0,0,0.15)', zIndex: 10000, maxHeight: '160px', overflowY: 'auto' }}>
                      {startSuggestions.map((place, i) => (
                        <div key={i} onClick={() => handleSelectPlace(place, 'start')} style={{ padding: '10px 12px', fontSize: '12px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
                          {place.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '4px' }}>DROP-OFF 🔴</label>
                  <input
                    type="text"
                    value={endQuery}
                    onFocus={() => setMapTargetType('end')}
                    onChange={(e) => handleInputChange(e.target.value, 'end')}
                    placeholder="Search destination..."
                    style={{ width: '100%', padding: '12px', fontSize: '13px', borderRadius: '8px', border: mapTargetType === 'end' ? '2px solid #dc3545' : '1px solid #ddd', boxSizing: 'border-box' }}
                    required
                  />
                  {endSuggestions.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 8px 16px rgba(0,0,0,0.15)', zIndex: 10000, maxHeight: '160px', overflowY: 'auto' }}>
                      {endSuggestions.map((place, i) => (
                        <div key={i} onClick={() => handleSelectPlace(place, 'end')} style={{ padding: '10px 12px', fontSize: '12px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
                          {place.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8f9fa', padding: '6px 10px', borderRadius: '8px', fontSize: '12px' }}>
                  <span style={{ color: '#666' }}>Click map sets:</span>
                  <button type="button" onClick={() => setMapTargetType('start')} style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: mapTargetType === 'start' ? '#007BFF' : '#e4e4e4', color: mapTargetType === 'start' ? '#fff' : '#333' }}>
                    Pickup 🟢
                  </button>
                  <button type="button" onClick={() => setMapTargetType('end')} style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: mapTargetType === 'end' ? '#dc3545' : '#e4e4e4', color: mapTargetType === 'end' ? '#fff' : '#333' }}>
                    Drop 🔴
                  </button>
                </div>

                <div style={{ height: '180px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd', zIndex: 1 }}>
                  <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <SetMapView center={mapCenter} />
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <ClickEventsHandler onClick={handleMapClick} />
                    <Marker position={[startLat, startLng]} />
                    <Marker position={[endLat, endLng]} />
                  </MapContainer>
                </div>

                <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '12px', background: '#fcfcfc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong style={{ fontSize: '14px' }}>FareShare Ride Sharing</strong>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        {isFareShare ? 'Enabled: Accept co-riders en route to split bill' : 'Disabled: Ride private / full cab to yourself'}
                      </div>
                    </div>
                    <input type="checkbox" checked={isFareShare} onChange={(e) => setIsFareShare(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                  </div>

                  {isFareShare && (
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#444' }}>Empty seats to offer:</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[1, 2, 3].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setSharedSeatsToOffer(num)}
                            style={{
                              padding: '4px 12px',
                              borderRadius: '6px',
                              border: sharedSeatsToOffer === num ? '2px solid #28a745' : '1px solid #ccc',
                              background: sharedSeatsToOffer === num ? '#e2f0d9' : '#fff',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}>
                            +{num} {num === 1 ? 'Seat' : 'Seats'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button type="submit" style={{ padding: '14px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                  Select Vehicle & Pricing
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div style={{ padding: '20px' }}>
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#007BFF', cursor: 'pointer', padding: 0, marginBottom: '10px' }}>← Change Route</button>
              <h3>Select Vehicle</h3>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '-6px', marginBottom: '15px' }}>
                Distance: {distanceKm.toFixed(1)} km | {isFareShare ? `Offering up to +${sharedSeatsToOffer} shared seats` : 'Solo/Private Ride'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <div onClick={() => setSelectedVehicle("moto")} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: selectedVehicle === 'moto' ? '2px solid #000' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: '#fafafa' }}>
                  <div>
                    <strong>🛵 FareShare Moto</strong>
                    <div style={{ fontSize: '11px', color: '#666' }}>Standard solo ride</div>
                  </div>
                  <strong style={{ fontSize: '16px' }}>₹{getBaseFare(15)}</strong>
                </div>

                <div onClick={() => setSelectedVehicle("mini")} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: selectedVehicle === 'mini' ? '2px solid #000' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: '#fafafa' }}>
                  <div>
                    <strong>🚗 FareShare Mini (Cab)</strong>
                    <div style={{ fontSize: '11px', color: '#666' }}>Compact hatchback</div>
                  </div>
                  <strong style={{ fontSize: '16px' }}>₹{getBaseFare(24)}</strong>
                </div>

                <div onClick={() => setSelectedVehicle("sedan")} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: selectedVehicle === 'sedan' ? '2px solid #000' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: '#fafafa' }}>
                  <div>
                    <strong>🚙 FareShare Sedan (Prime)</strong>
                    <div style={{ fontSize: '11px', color: '#666' }}>Extra legroom & comfort</div>
                  </div>
                  <strong style={{ fontSize: '16px' }}>₹{getBaseFare(36)}</strong>
                </div>
              </div>

              <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '12px', color: '#555' }}>
                💡 <strong>Base Upfront Fare:</strong> You book the entire car first. In-transit riders who join will split this fare directly in real time.
              </div>

              <button onClick={handleConfirmRide} style={{ width: '100%', padding: '14px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                Book {selectedVehicle.toUpperCase()} Now
              </button>
            </div>
          )}

          {step === 3 && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', border: '4px solid #eee', borderTop: '4px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 15px auto' }}></div>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <h3>Dispatching Cab...</h3>
              <p style={{ color: '#666', fontSize: '13px' }}>Assigning your private driver on the network.</p>
            </div>
          )}

          {step === 4 && activeRide && (
            <div style={{ padding: '20px' }}>
              <div style={{ background: '#28a745', color: '#fff', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase' }}>Trip In Progress</div>
                  <strong style={{ fontSize: '15px' }}>{activeRide.vehicle} • Cruising</strong>
                </div>
                <span style={{ fontSize: '12px', background: '#1e7e34', padding: '4px 8px', borderRadius: '6px' }}>{activeRide.rideId}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                  <div style={{ fontSize: '11px', color: '#666' }}>Your Current Share</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>₹{activeRide.myCurrentShare}</div>
                  {activeRide.myCurrentShare < activeRide.totalFare && (
                    <div style={{ fontSize: '10px', color: '#666', textDecoration: 'line-through' }}>Original: ₹{activeRide.totalFare}</div>
                  )}
                </div>
                <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                  <div style={{ fontSize: '11px', color: '#666' }}>Seats Remaining</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{activeRide.remainingSeats} Seats</div>
                  <div style={{ fontSize: '10px', color: '#666' }}>Max: {activeRide.offeredSeats}</div>
                </div>
              </div>

              <div style={{ marginTop: '12px', padding: '10px', border: '1px solid #eee', borderRadius: '8px', fontSize: '12px' }}>
                <strong>Driver:</strong> {activeRide.driverName}
              </div>

              <div style={{ marginTop: '15px' }}>
                <strong style={{ fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                  Accepted Co-Riders ({acceptedRiders.length}):
                </strong>
                {acceptedRiders.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#888', fontStyle: 'italic', background: '#f9f9f9', padding: '10px', borderRadius: '6px' }}>
                    {activeRide.isFareShare ? 'Waiting for real-time join requests from peers along your route...' : 'Solo Ride.'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {acceptedRiders.map((r, idx) => (
                      <div key={idx} style={{ background: '#e2f0d9', border: '1px solid #c3e6cb', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>👤 {r.riderName}</strong>
                          <div style={{ fontSize: '10px', color: '#555' }}>Pickup: {r.pickupLoc}</div>
                        </div>
                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>-₹{r.fareContribution} saved</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* REAL-TIME INCOMING CO-RIDER REQUEST MODAL */}
              {incomingRequest && activeRide.remainingSeats > 0 && (
                <div style={{ marginTop: '18px', padding: '16px', background: '#fff', border: '2px solid #007BFF', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,123,255,0.25)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', background: '#007BFF', color: '#fff', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                      🔔 LIVE CO-RIDER REQUEST
                    </span>
                    <span style={{ fontSize: '11px', color: '#666', fontWeight: 'bold' }}>{incomingRequest.detour}</span>
                  </div>

                  <h4 style={{ margin: '4px 0' }}>{incomingRequest.riderName}</h4>
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#555' }}>
                    Pickup: <strong>{incomingRequest.pickupLoc}</strong> → <strong>{incomingRequest.dropLoc}</strong>
                  </p>
                  <div style={{ fontSize: '12px', color: '#28a745', fontWeight: 'bold', margin: '6px 0 12px 0' }}>
                    💰 Will split fare and save you ~₹{incomingRequest.fareContribution}!
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={handleAcceptCoRider}
                      style={{ flex: 1, padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Accept (+1)
                    </button>
                    <button
                      onClick={handleDeclineCoRider}
                      style={{ flex: 1, padding: '10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Decline
                    </button>
                  </div>
                </div>
              )}

              <button onClick={() => setStep(1)} style={{ width: '100%', marginTop: '25px', padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                End Trip
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
}

export default App;