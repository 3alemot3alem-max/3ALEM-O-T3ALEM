const fs = require('fs');
let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

// Change the Right Sidebar container class
const oldSidebarClass = '          <div className="w-full lg:w-[300px] shrink-0 space-y-4 order-2 md:order-3">';
const newSidebarClass = '          <div className="hidden lg:block w-full lg:w-[300px] shrink-0 space-y-4 order-2 md:order-3">';

code = code.replace(oldSidebarClass, newSidebarClass);

fs.writeFileSync('src/components/Feed.tsx', code);
