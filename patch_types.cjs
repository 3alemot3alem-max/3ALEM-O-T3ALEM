const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  "imageUrl?: string;",
  "imageUrl?: string;\n  imageUrls?: string[];"
);

fs.writeFileSync('src/types.ts', code);
