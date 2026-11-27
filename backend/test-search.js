async function searchForRides() {
  try {
    console.log("Secondary Rider searching for rides nearby...");
    
    const response = await fetch('http://localhost:5000/api/rides/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Slightly offset from Aman's original route to test the radius math
        startLat: 30.7350, 
        startLng: 76.7750,
        endLat: 30.7400,
        endLng: 76.7690,
        searchRadiusKm: 2 // Looking for rides within 2km of my pickup/dropoff
      })
    });

    const data = await response.json();
    console.log("Search Results:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

searchForRides();