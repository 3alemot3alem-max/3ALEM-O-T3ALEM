const fs = require('fs');
let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

const rightSidebarStart = `{/* Right Sidebar */}
          <div className="w-full lg:w-[300px] shrink-0 space-y-4 order-2 md:order-3">
             {expandedComments && posts.find(p => p.id === expandedComments) && (
                <div className="hidden lg:flex bg-white rounded-xl shadow-[0_0_0_1px_rgba(0,0,0,0.08)] flex-col sticky top-20 z-10" style={{ height: 'calc(100vh - 120px)' }}>
                   <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare size={18} className="text-[#1EBA64]" />
                        Questions
                      </div>
                      <button 
                        onClick={() => setExpandedComments(null)}
                        className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
                      >
                        <X size={18} />
                      </button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                     <CommentSection postId={expandedComments} postAuthorUid={posts.find(p => p.id === expandedComments)?.authorUid || ''} />
                   </div>
                </div>
             )}
             
             <div className={\`\${expandedComments ? 'lg:hidden' : ''} space-y-4\`}>`;

const rightSidebarStartNew = `{/* Right Sidebar */}
          <div className="w-full lg:w-[300px] shrink-0 space-y-4 order-2 md:order-3">`;

code = code.replace(rightSidebarStart, rightSidebarStartNew);

const rightSidebarEnd = `              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}`;

const rightSidebarEndNew = `              </div>
            )}
          </div>
        </div>
      </div>

      {/* Registration Modal */}`;
code = code.replace(rightSidebarEnd, rightSidebarEndNew);

const inlineComments = `                  {/* Comments Section */}
                  <AnimatePresence>
                    {expandedComments === post.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-white border-t border-slate-100 block lg:hidden"
                      >
                        <div className="p-4 pl-[3.5rem] sm:pl-[4.5rem]">
                          <CommentSection postId={post.id} postAuthorUid={post.authorUid} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>`;

code = code.replace(inlineComments, ``);

fs.writeFileSync('src/components/Feed.tsx', code);
