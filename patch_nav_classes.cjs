const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// desktop
code = code.replace(/tour-nav-\$\{tab\.id\}/g, "desktop-tour-nav-${tab.id}");

// mobile (we already replaced the mobile one, so it currently has tour-nav-. We need to find the mobile nav block and replace it)
// actually, since we blindly replaced both, they both have desktop-tour-nav- now.
// Let's refine:
fs.writeFileSync('src/App.tsx', code);
