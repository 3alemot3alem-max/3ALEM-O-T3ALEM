const fs = require('fs');
let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

// 1. Separate posts
const postsStart = `            {/* Posts List */}
            <div className="bg-white sm:rounded-xl shadow-[0_0_0_1px_rgba(0,0,0,0.08)] overflow-hidden border-y border-slate-200 sm:border-none divide-y divide-slate-100">
              {filteredPosts.map((post) => (
                <div 
                  key={post.id}
                  className="bg-white hover:bg-slate-50/50 transition-colors"
                >
                  <div className="p-4 flex gap-3 sm:gap-4">`;

const newPostsStart = `            {/* Posts List */}
            <div className="space-y-4">
              {filteredPosts.map((post, index) => (
                <div 
                  key={post.id}
                  className={\`bg-white sm:rounded-xl shadow-[0_0_0_1px_rgba(0,0,0,0.08)] overflow-hidden border-y border-slate-200 sm:border-none hover:bg-slate-50/50 transition-colors \${index === 0 ? 'tour-first-post' : ''}\`}
                >
                  <div className="p-4 flex gap-3 sm:gap-4">`;
code = code.replace(postsStart, newPostsStart);

// 2. Add classes to other elements
code = code.replace(
  '<span className="text-xs font-semibold text-slate-500 line-clamp-1">Vues de votre profil</span>',
  '<span className="tour-profile-views text-xs font-semibold text-slate-500 line-clamp-1">Vues de votre profil</span>'
);

code = code.replace(
  'placeholder="Partager un article..."',
  'placeholder="Partager un article..."\n                    className="tour-share-post flex-1 bg-white border border-slate-400 hover:bg-slate-100 focus:bg-white rounded-[32px] px-4 py-3 outline-none text-sm text-slate-700 transition-colors cursor-text resize-none min-h-[48px]"'
);
// wait the className is already there, I need to replace it.
code = code.replace(
  'className="flex-1 bg-white border border-slate-400 hover:bg-slate-100 focus:bg-white rounded-[32px] px-4 py-3 outline-none text-sm text-slate-700 transition-colors cursor-text resize-none min-h-[48px]"',
  'className="tour-share-post flex-1 bg-white border border-slate-400 hover:bg-slate-100 focus:bg-white rounded-[32px] px-4 py-3 outline-none text-sm text-slate-700 transition-colors cursor-text resize-none min-h-[48px]"'
);

code = code.replace(
  '<div className="w-full lg:w-[300px] shrink-0 space-y-4 order-2 md:order-3">',
  '<div className="w-full lg:w-[300px] shrink-0 space-y-4 order-2 md:order-3">'
);

// We need to add class to right sidebar news
code = code.replace(
  '<h3 className="font-semibold text-slate-900 text-base">Actualités du réseau</h3>',
  '<h3 className="tour-news-sidebar font-semibold text-slate-900 text-base">Actualités du réseau</h3>'
);

// right sidebar offers
code = code.replace(
  '<div className="sticky top-24 overflow-hidden rounded-xl shadow-[0_0_0_1px_rgba(0,0,0,0.08)] text-center text-slate-500 bg-white relative">',
  '<div className="tour-offers-sidebar sticky top-24 overflow-hidden rounded-xl shadow-[0_0_0_1px_rgba(0,0,0,0.08)] text-center text-slate-500 bg-white relative">'
);

// Questions button
code = code.replace(
  '<button \n                            onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}\n                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors bg-[#1EBA64] text-white hover:bg-emerald-600 shadow-sm shrink-0 whitespace-nowrap"',
  '<button \n                            onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}\n                            className="tour-post-questions flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors bg-[#1EBA64] text-white hover:bg-emerald-600 shadow-sm shrink-0 whitespace-nowrap"'
);

fs.writeFileSync('src/components/Feed.tsx', code);
