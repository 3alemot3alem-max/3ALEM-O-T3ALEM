const fs = require('fs');
let code = fs.readFileSync('src/components/Notifications.tsx', 'utf8');

const regex = /<img\s*src=\{notification\.senderPhoto\}\s*alt=\{notification\.senderName\}\s*className="[^"]+"/;
const replacement = `<img 
                src={notification.senderPhoto}
                alt={notification.senderName}
                className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-white cursor-pointer hover:opacity-90"
                onClick={(e) => { e.stopPropagation(); onViewProfile?.(notification.senderId); }}
              />`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/Notifications.tsx', code);
