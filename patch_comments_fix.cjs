const fs = require('fs');
let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

code = code.replace(
  `const { deleteDoc, doc } = await import('firebase/firestore');`,
  ``
);

fs.writeFileSync('src/components/Feed.tsx', code);
