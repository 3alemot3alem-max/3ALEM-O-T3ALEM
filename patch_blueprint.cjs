const fs = require('fs');
const blueprint = JSON.parse(fs.readFileSync('firebase-blueprint.json', 'utf8'));

blueprint.entities.Notification = {
  title: "Notification",
  description: "User notification",
  type: "object",
  properties: {
    id: { type: "string" },
    recipientId: { type: "string" },
    senderId: { type: "string" },
    senderName: { type: "string" },
    senderPhoto: { type: "string" },
    type: { type: "string", enum: ["like", "comment", "share", "news"] },
    postId: { type: "string" },
    content: { type: "string" },
    read: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" }
  },
  required: ["recipientId", "senderId", "senderName", "type", "content", "read", "createdAt"]
};

blueprint.firestore["/notifications/{notificationId}"] = {
  schema: "Notification",
  description: "User notifications"
};

fs.writeFileSync('firebase-blueprint.json', JSON.stringify(blueprint, null, 2));
