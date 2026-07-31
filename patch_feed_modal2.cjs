const fs = require('fs');
let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

const postModalCode = `
      {/* Registration Modal */}`;

const newPostModalCode = `
      {/* Post Modal (Questions) */}
      <AnimatePresence>
        {expandedComments && posts.find(p => p.id === expandedComments) && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 lg:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedComments(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white md:rounded-2xl w-full h-full md:max-h-[90vh] lg:max-w-6xl relative z-10 shadow-2xl overflow-hidden flex flex-col lg:flex-row"
            >
              {/* Close Button Mobile */}
              <button 
                onClick={() => setExpandedComments(null)}
                className="lg:hidden absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-black/40 text-white rounded-full backdrop-blur-sm"
              >
                <X size={20} />
              </button>

              {/* Left Side: Post Content */}
              <div className="w-full lg:w-[55%] flex-1 overflow-y-auto bg-slate-50 relative border-b lg:border-b-0 lg:border-r border-slate-200 custom-scrollbar">
                {(() => {
                  const post = posts.find(p => p.id === expandedComments)!;
                  return (
                    <div className="p-4 sm:p-6 lg:p-8">
                      {/* Avatar & Author info duplicated for modal display */}
                      <div className="flex gap-4 mb-4">
                        <img 
                          src={post.authorPhoto || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${post.authorUid}\`} 
                          className="w-12 h-12 rounded-full object-cover shadow-sm"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 flex items-center gap-1 text-[15px]">
                            {post.authorName}
                            {(post.authorRole === 'school' || post.authorRole === 'admin') && (
                              <svg className="w-[15px] h-[15px] text-[#1EBA64] fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm-1.06 14.86l-4.14-4.13 1.41-1.42 2.73 2.72 6.03-6.02 1.41 1.41-7.44 7.44z" />
                              </svg>
                            )}
                          </h4>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[13px]">
                            <span>@{post.authorName.replace(/\\s+/g, '').toLowerCase()}</span>
                            <span>·</span>
                            <span>{new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Post Text */}
                      <p className="text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap mb-4">
                        {post.content}
                      </p>

                      {/* Post Images */}
                      {post.images && post.images.length > 0 && (
                        <div className="w-full bg-slate-100 rounded-xl overflow-hidden mt-4">
                          <img 
                            src={post.images[0]} 
                            className="w-full h-auto max-h-[70vh] object-contain"
                            alt="Post attached image"
                          />
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Right Side: Comments (Questions) */}
              <div className="w-full lg:w-[45%] flex flex-col h-full bg-white relative">
                {/* Header */}
                <div className="hidden lg:flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare size={20} className="text-[#1EBA64]" />
                    Questions
                  </h3>
                  <button 
                    onClick={() => setExpandedComments(null)}
                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {/* Comments Container */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <CommentSection postId={expandedComments} postAuthorUid={posts.find(p => p.id === expandedComments)?.authorUid || ''} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Registration Modal */}`;

code = code.replace(postModalCode, newPostModalCode);

fs.writeFileSync('src/components/Feed.tsx', code);
