const fs = require('fs');
let code = fs.readFileSync('src/components/Notifications.tsx', 'utf8');

code = code.replace(
  'export const Notifications: React.FC = () => {',
  'export const Notifications: React.FC<{ onViewProfile?: (uid: string) => void }> = ({ onViewProfile }) => {'
);

code = code.replace(
  '<img \\n                 src={notification.senderPhoto}\\n                 alt={notification.senderName}\\n                 className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-white"\\n              />',
  '<img \\n                 src={notification.senderPhoto}\\n                 alt={notification.senderName}\\n                 className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-white cursor-pointer"\\n                 onClick={(e) => { e.stopPropagation(); onViewProfile?.(notification.senderId); }}\\n              />'
);

code = code.replace(
  '<span className="font-semibold text-slate-900">{notification.senderName}</span>',
  '<span className="font-semibold text-slate-900 cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); onViewProfile?.(notification.senderId); }}>{notification.senderName}</span>'
);

fs.writeFileSync('src/components/Notifications.tsx', code);
