const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import { Toaster } from 'react-hot-toast';")) {
  code = code.replace(
    "import { useNotifications } from './useNotifications';",
    "import { useNotifications } from './useNotifications';\nimport { Toaster } from 'react-hot-toast';"
  );
  
  code = code.replace(
    "<ErrorBoundary>",
    "<ErrorBoundary>\n      <Toaster position=\"top-center\" toastOptions={{ duration: 4000, style: { background: '#1EBA64', color: '#fff', fontWeight: 'bold' } }} />"
  );
  
  fs.writeFileSync('src/App.tsx', code);
}
