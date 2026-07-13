const fs = require('fs');
let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

const deleteCommentFunc = `
  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(db, \`posts/\${postId}/comments\`, commentId));
      await updateDoc(doc(db, 'posts', postId), {
        commentsCount: increment(-1)
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };
`;

code = code.replace(
  `  const handleAddComment = async (e: React.FormEvent) => {`,
  deleteCommentFunc + `\n  const handleAddComment = async (e: React.FormEvent) => {`
);

code = code.replace(
  `<button className="text-[12px] text-slate-500 font-semibold hover:text-slate-800 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100">Répondre</button>`,
  `<button className="text-[12px] text-slate-500 font-semibold hover:text-slate-800 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100">Répondre</button>
                {user?.uid === comment.authorUid && (
                  <button 
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-[12px] text-red-500 font-semibold hover:text-red-600 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 flex items-center gap-1"
                  >
                    Supprimer
                  </button>
                )}`
);

fs.writeFileSync('src/components/Feed.tsx', code);
