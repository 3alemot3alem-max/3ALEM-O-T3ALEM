require('dotenv').config();
console.log("Length:", process.env.FIREBASE_PRIVATE_KEY?.length);
console.log("StartsWith:", process.env.FIREBASE_PRIVATE_KEY?.substring(0, 30));
console.log("EndsWith:", process.env.FIREBASE_PRIVATE_KEY?.substring(process.env.FIREBASE_PRIVATE_KEY.length - 30));
console.log("Has \\\\n:", process.env.FIREBASE_PRIVATE_KEY?.includes('\\n'));
console.log("Has \\n:", process.env.FIREBASE_PRIVATE_KEY?.includes('\n'));
