const fs = require('fs');
let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

code = code.replace(
  'className="tour-share-post flex-1 bg-white border border-slate-400 hover:bg-slate-100 focus:bg-white rounded-[32px] px-4 py-3 outline-none text-sm text-slate-700 transition-colors cursor-text resize-none min-h-[48px]"\\n                    className="tour-share-post flex-1 bg-white border border-slate-400 hover:bg-slate-100 focus:bg-white rounded-[32px] px-4 py-3 outline-none text-sm text-slate-700 transition-colors cursor-text resize-none min-h-[48px]"',
  'className="tour-share-post flex-1 bg-white border border-slate-400 hover:bg-slate-100 focus:bg-white rounded-[32px] px-4 py-3 outline-none text-sm text-slate-700 transition-colors cursor-text resize-none min-h-[48px]"'
);

fs.writeFileSync('src/components/Feed.tsx', code);
