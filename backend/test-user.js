// This is a simple script to test our API
async function createTestUser() {
  try {
    const response = await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Here is the fake user data we are sending to your database
      body: JSON.stringify({
        name: "Test Rider",
        email: "testrider@university.edu",
        role: "PRIMARY_RIDER"
      })
    });

    const data = await response.json();
    console.log("Server Response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

createTestUser();