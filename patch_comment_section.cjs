const fs = require('fs');
let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

const oldReturn = `  return (
    <div className="space-y-5 px-1 py-2">
      <div className="space-y-4">
        {comments.map((comment) => (`;

const newReturn = `  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 px-1 py-2 custom-scrollbar">
        {comments.map((comment) => (`;

code = code.replace(oldReturn, newReturn);

const oldFormStart = `        ))}
      </div>
      <form onSubmit={handleAddComment} className="flex gap-3 mt-6 pt-4 border-t border-slate-100 relative items-center">`;

const newFormStart = `        ))}
      </div>
      <div className="shrink-0 pt-4 pb-2 px-1 bg-white border-t border-slate-100 mt-auto">
        <form onSubmit={handleAddComment} className="flex gap-3 relative items-center">`;

code = code.replace(oldFormStart, newFormStart);

const oldFormEnd = `        </div>
      </form>
    </div>
  );`;

const newFormEnd = `        </div>
        </form>
      </div>
    </div>
  );`;

code = code.replace(oldFormEnd, newFormEnd);

fs.writeFileSync('src/components/Feed.tsx', code);
