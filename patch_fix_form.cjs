const fs = require('fs');
let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

const oldFormStart = `      <form onSubmit={handleAddComment} className="flex gap-3 mt-6 pt-4 border-t border-slate-100 relative items-center">`;
const newFormStart = `      <div className="shrink-0 pt-4 pb-2 px-1 bg-white border-t border-slate-100 mt-auto">
        <form onSubmit={handleAddComment} className="flex gap-3 relative items-center">`;

code = code.replace(oldFormStart, newFormStart);

fs.writeFileSync('src/components/Feed.tsx', code);
