const fs = require('fs');
let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

const oldContainer = `                {/* Comments Container */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <CommentSection postId={expandedComments} postAuthorUid={posts.find(p => p.id === expandedComments)?.authorUid || ''} />
                </div>`;

const newContainer = `                {/* Comments Container */}
                <div className="flex-1 flex flex-col p-4 overflow-hidden">
                  <CommentSection postId={expandedComments} postAuthorUid={posts.find(p => p.id === expandedComments)?.authorUid || ''} />
                </div>`;

code = code.replace(oldContainer, newContainer);

fs.writeFileSync('src/components/Feed.tsx', code);
