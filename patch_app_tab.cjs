const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const tabState = "const [activeTab, setActiveTab] = useState<'feed' | 'schools' | 'profile' | 'ai' | 'notifications'>('feed');";
const newTabState = `const [activeTab, setActiveTab] = useState<'feed' | 'schools' | 'profile' | 'ai' | 'notifications'>(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('tab') as any) || 'feed';
  });`;

code = code.replace(tabState, newTabState);

fs.writeFileSync('src/App.tsx', code);
