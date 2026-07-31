const fs = require('fs');
let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

code = code.replace(
  \`className="ml-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-bold border transition-colors bg-[#1EBA64]/10 text-[#1EBA64] border-transparent hover:bg-[#1EBA64]/20"\`,
  \`className="ml-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold transition-colors bg-[#1EBA64] text-white hover:bg-emerald-600 shadow-sm"\`
);

fs.writeFileSync('src/components/Feed.tsx', code);
