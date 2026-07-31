const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

const oldUpdate = "allow update: if isSignedIn() && existing().recipientId == request.auth.uid && \\n                    incoming().diff(existing()).affectedKeys().hasOnly(['read']);";
const newUpdate = `allow update: if isSignedIn() && (
        (existing().recipientId == request.auth.uid && incoming().diff(existing()).affectedKeys().hasOnly(['read'])) ||
        (existing().recipientId == 'all' && incoming().diff(existing()).affectedKeys().hasOnly(['readBy']))
      );`;

rules = rules.replace(oldUpdate, newUpdate);
// Wait, the new line spacing might be different. Let's use a regex.

const regex = /allow update: if isSignedIn\(\) && existing\(\)\.recipientId == request\.auth\.uid &&\s+incoming\(\)\.diff\(existing\(\)\)\.affectedKeys\(\)\.hasOnly\(\['read'\]\);/s;

rules = rules.replace(regex, newUpdate);

fs.writeFileSync('firestore.rules', rules);
