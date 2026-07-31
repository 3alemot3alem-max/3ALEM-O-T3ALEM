const fs = require('fs');
let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

code = code.replace(
  \`className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold transition-colors bg-[#1EBA64]/10 text-[#1EBA64] hover:bg-[#1EBA64]/20"\`,
  \`className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold transition-colors bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200 shadow-sm"\`
);

fs.writeFileSync('src/components/Feed.tsx', code);
