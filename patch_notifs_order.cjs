const fs = require('fs');
let code = fs.readFileSync('src/components/Notifications.tsx', 'utf8');

code = code.replace(/orderBy\('createdAt', 'desc'\)/g, '');
code = code.replace(/,\s*\n\s*\)/g, '\n    )'); // Clean up trailing commas before closing parenthesis

fs.writeFileSync('src/components/Notifications.tsx', code);
