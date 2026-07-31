const fs = require('fs');
let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

const oldHeader = `                          <span className="text-[14px] text-slate-500 hover:underline cursor-pointer whitespace-nowrap">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>`;
const newHeader = `                          <span className="text-[14px] text-slate-500 hover:underline cursor-pointer whitespace-nowrap">
                            {formatDate(post.createdAt)}
                          </span>
                          <button 
                            onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
                            className="ml-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-bold border transition-colors bg-[#1EBA64]/10 text-[#1EBA64] border-transparent hover:bg-[#1EBA64]/20"
                          >
                            <MessageSquare size={13} />
                            Questions {post.commentsCount > 0 ? \`(\${post.commentsCount})\` : ''}
                          </button>
                        </div>`;

code = code.replace(oldHeader, newHeader);

const oldActionBar = `                      {/* Action Bar */}
                      <div className="flex justify-between items-center text-slate-500 mt-1 max-w-[425px] pr-4">
                        <button 
                          onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
                          className={\`flex items-center gap-1 group transition-colors \${expandedComments === post.id ? 'text-[#1EBA64]' : ''}\`}
                        >
                          <div className={\`p-2 rounded-full transition-colors \${expandedComments === post.id ? 'bg-[#1EBA64]/10' : 'group-hover:bg-[#1EBA64]/10 group-hover:text-[#1EBA64]'}\`}>
                            <MessageSquare size={18} />
                          </div>
                          <span className={\`text-[13px] \${expandedComments === post.id ? '' : 'group-hover:text-[#1EBA64]'}\`}>{post.commentsCount > 0 ? post.commentsCount : ''}</span>
                        </button>
                        
                        <button `;

const newActionBar = `                      {/* Action Bar */}
                      <div className="flex justify-between items-center text-slate-500 mt-1 max-w-[425px] pr-4">
                        <button `;

code = code.replace(oldActionBar, newActionBar);

// Replace "Écrivez un commentaire..." with "Posez une question..."
code = code.replace('placeholder="Écrivez un commentaire..."', 'placeholder="Posez une question..."');

fs.writeFileSync('src/components/Feed.tsx', code);
