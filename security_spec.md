# Security Specification for 3ALEM O T3ALEM

## 1. Data Invariants
- A user profile must have a valid UID matching their Auth UID.
- A post must have a valid author UID.
- A comment must belong to a post and have a valid author UID.
- A chat must have exactly two participants (sender and recipient).
- A message must belong to a chat and the sender must be a participant in that chat.
- Timestamps must be valid ISO strings (or Server Timestamps if migrating, currently using strings).

## 2. The "Dirty Dozen" Payloads (Deny List)

1. **Identity Spoofing**: Create a post with someone else's `authorUid`.
2. **Post Hijacking**: Update another user's post content.
3. **Like Inflation**: Update `likesCount` by +100 in one go.
4. **Member Injection**: Add yourself to a chat you are not part of.
5. **Message Forgery**: Send a message in a chat as another participant.
6. **Chat Snooping**: Read messages from a chat you are not participating in.
7. **Role Escalation**: Update your own user profile to set `role: 'mentor'` if you are a student (assuming only admins or specific flow should do this, but here users set it on signup). Wait, here users set their own role. But maybe they shouldn't change it after?
8. **Shadow Field Injection**: Adding `isAdmin: true` to a user profile.
9. **Resource Poisoning**: IDs longer than 128 chars.
10. **State Corruption**: Setting `likesCount` to a negative value.
11. **PII Leak**: Reading all user profiles without being authenticated.
12. **Comment Forgery**: Adding a comment as another user.

## 3. Test Runner (Draft)
```typescript
// This would be firestore.rules.test.ts
// Verifying that all above payloads return PERMISSION_DENIED.
```
