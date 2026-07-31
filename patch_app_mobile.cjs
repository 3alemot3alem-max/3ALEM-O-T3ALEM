const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const mobileNavButton = "className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${";
const newMobileNavButton = "className={`tour-nav-${tab.id} flex flex-col items-center justify-center w-full h-full space-y-1 relative ${";
code = code.replace(mobileNavButton, newMobileNavButton);

fs.writeFileSync('src/App.tsx', code);
