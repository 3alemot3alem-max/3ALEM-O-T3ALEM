require('dotenv').config();
try {
  const parsed = JSON.parse(process.env.FIREBASE_PRIVATE_KEY);
  console.log("Parsed keys:", Object.keys(parsed));
} catch(e) {
  console.error("Parse error:", e);
}
