const fs = require('fs');
let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

// 1. Add inputRef and handleReplyClick to CommentSection
const sectionStart = `const CommentSection: React.FC<{ postId: string, postAuthorUid: string }> = ({ postId, postAuthorUid }) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');`;

const newSectionStart = `const CommentSection: React.FC<{ postId: string, postAuthorUid: string }> = ({ postId, postAuthorUid }) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleReplyClick = (authorName: string) => {
    const mention = \`@\${authorName.replace(/\\s+/g, '')} \`;
    setNewComment(mention);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };`;

code = code.replace(sectionStart, newSectionStart);

// 2. Add ref to input
const inputStart = `<input 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Posez une question..."`;

const newInputStart = `<input 
            ref={inputRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Posez une question..."`;

code = code.replace(inputStart, newInputStart);

// 3. Update the reply button
const replyBtn = `<button className="text-[12px] text-slate-500 font-semibold hover:text-slate-800 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100">Répondre</button>`;
const newReplyBtn = `<button 
                  onClick={() => handleReplyClick(comment.authorName)}
                  className="text-[12px] text-slate-500 font-semibold hover:text-slate-800 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                >
                  Répondre
                </button>`;

code = code.replace(replyBtn, newReplyBtn);

// Also need to add useRef import if missing, but React.useRef works.
fs.writeFileSync('src/components/Feed.tsx', code);
