async function test() {
  try {
    const res = await fetch('https://quizapp-backend-seven.vercel.app/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@quizapp.com', password: 'admin123' })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Data:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
