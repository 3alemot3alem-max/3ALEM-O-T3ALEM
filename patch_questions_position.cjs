const fs = require('fs');
let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

const oldCode = `                          <span className="text-[14px] text-slate-500 hover:underline cursor-pointer whitespace-nowrap">
                            {formatDate(post.createdAt)}
                          </span>
                          <button 
                            onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
                            className="ml-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold transition-colors bg-[#1EBA64] text-white hover:bg-emerald-600 shadow-sm"
                          >
                            <MessageSquare size={13} />
                            Questions {post.commentsCount > 0 ? \`(\${post.commentsCount})\` : ''}
                          </button>
                        </div>
                        
                        {user?.uid === post.authorUid && (
                          <div className="flex items-center gap-1 -mt-1 -mr-2">`;

const newCode = `                          <span className="text-[14px] text-slate-500 hover:underline cursor-pointer whitespace-nowrap">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold transition-colors bg-[#1EBA64]/10 text-[#1EBA64] hover:bg-[#1EBA64]/20"
                          >
                            <MessageSquare size={13} />
                            Questions {post.commentsCount > 0 ? \`(\${post.commentsCount})\` : ''}
                          </button>
                          {user?.uid === post.authorUid && (
                            <div className="flex items-center gap-1 -mt-1 -mr-2">`;

code = code.replace(oldCode, newCode);

fs.writeFileSync('src/components/Feed.tsx', code);
