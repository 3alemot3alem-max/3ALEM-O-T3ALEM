const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix mobile top header
code = code.replace(
  '<span className="font-serif italic font-bold ml-2 text-moroccan-red flex items-center gap-1">3alem <AppLogo className="w-10 h-10 text-moroccan-red object-contain" /> t3alem</span>',
  '<span className="font-serif italic font-bold ml-1 text-xl text-moroccan-red flex items-center gap-1">3alem <AppLogo className="w-8 h-8 text-moroccan-red object-contain" /> t3alem</span>'
);

code = code.replace(
  '<button \n              onClick={() => auth.signOut()}\n              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"\n            >\n              <LogOut size={20} />\n            </button>',
  '<button \n              onClick={() => auth.signOut()}\n              className="text-slate-700 hover:text-moroccan-red hover:bg-black/5 p-2 rounded-xl transition-all"\n            >\n              <LogOut size={22} />\n            </button>'
);

fs.writeFileSync('src/App.tsx', code);
