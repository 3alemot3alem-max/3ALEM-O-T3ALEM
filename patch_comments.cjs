const fs = require('fs');
let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

const oldComment = `<UserDisplay 
                uid={comment.authorUid} 
                fallbackName={comment.authorName} 
                fallbackPhoto={comment.authorPhoto}
                size="sm"
                hideName={true}
              />`;

const newComment = `<UserDisplay 
                uid={comment.authorUid} 
                fallbackName={comment.authorName} 
                fallbackPhoto={comment.authorPhoto}
                size="sm"
                hideName={true}
                onClick={() => onViewProfile?.(comment.authorUid)}
              />`;

code = code.replace(oldComment, newComment);

const oldName = '<span className="font-semibold text-slate-900 mr-2">{comment.authorName}</span>';
const newName = '<span className="font-semibold text-slate-900 mr-2 cursor-pointer hover:underline" onClick={() => onViewProfile?.(comment.authorUid)}>{comment.authorName}</span>';

code = code.replace(oldName, newName);

fs.writeFileSync('src/components/Feed.tsx', code);
