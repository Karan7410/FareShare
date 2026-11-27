async function runFullFlowTest() {
  try {
    console.log("1. Creating Primary Rider...");
    const user1Res = await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: "Primary Aman", email: "aman@example.com" })
    });
    const user1 = await user1Res.json();
    console.log("Primary User:", user1.user?.id);

    console.log("2. Creating Secondary Rider...");
    const user2Res = await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: "Secondary Rohit", email: "rohit@example.com" })
    });
    const user2 = await user2Res.json();
    console.log("Secondary User:", user2.user?.id);

    console.log("3. Primary creates FareShare ride with 2 seats...");
    const rideRes = await fetch('http://localhost:5000/api/rides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        primaryRiderId: user1.user.id,
        startLat: 30.7333,
        startLng: 76.7794,
        endLat: 30.7414,
        endLng: 76.7680,
        isFareShare: true,
        sharedSeats: 2
      })
    });
    const ride = await rideRes.json();
    console.log("Ride Created:", ride.ride?.id);

    console.log("4. Secondary sends join request...");
    const joinRes = await fetch(`http://localhost:5000/api/rides/${ride.ride.id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secondaryRiderId: user2.user.id,
        startLat: 30.7350,
        startLng: 76.7750,
        endLat: 30.7400,
        endLng: 76.7690
      })
    });
    const joinData = await joinRes.json();
    console.log("Join Request Response:", joinData);

  } catch (err) {
    console.error("Test error:", err);
  }
}

runFullFlowTest();