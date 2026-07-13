# NexaFlow Architecture

## High-Level Design

[React + Vite]
│── REST API (axios + interceptors)
│── WebSocket (socket.io-client)
↓
[Express.js API]
│── Middleware: Helmet, CORS, authenticate, checkPermission, rateLimiter
│── Modules: auth, user, org, project, task, chat, file, comment,
│            notification, activity, search, analytics, ai
│
├── MongoDB Atlas (primary data store)
├── Redis (cache + rate limiting + socket adapter)
├── Cloudinary (file storage, streaming)
└── Groq API

## Database Schema (9 collections)
User           — email(u) · passwordHash · refreshTokenHash
Org            — ownerId · members[{userId, role}]
Project        — orgId · members[{userId, role}] · color · order
Task           — projectId · orgId · status · priority · order · assignees[]
Message        — channelId(str) · senderId · readBy[] · isDeleted
File           — cloudinaryUrl · publicId · projectId · taskId
Comment        — taskId · authorId · parentId · likes[] · mentions[]
Notification   — userId · actorId · type · isRead · refId
ActivityLog    — orgId · projectId · actorId · action · entityType

## Socket.io Room Strategy

user:{userId}        → personal notifications, stat updates
project:{projectId}  → task events, activity feed
channel:{channelId}  → chat messages, typing indicators

## Redis Cache Keys
org:members:{orgId}          TTL 10min  → invalidate on member change
project:{projectId}          TTL 5min   → invalidate on project update
user:notif:unread:{userId}   TTL 1min   → invalidate on notification
ai:ratelimit:{userId}        TTL 60s    → atomic INCR rate limiter

## Auth Flow
Register → bcrypt hash password → hashed verify token in DB →
send raw token in email → user clicks link → bcrypt.compare →
isVerified: true
Login → bcrypt.compare → generate accessToken(15min) +
refreshToken(7d) → hash refresh token → store hash in DB →
set httpOnly cookie
Token expired → frontend interceptor catches 401 "Token expired" →
queue concurrent requests → POST /auth/refresh → bcrypt.compare
stored hash → rotate token → retry queued requests

## Key Design Patterns

| Pattern | Location | Purpose |
|---------|----------|---------|
| Strategy | AI module strategies | Swappable AI operations |
| Observer | EventBus + listeners | Decouple actions from side effects |
| Singleton | Redis, MongoDB, Groq | One connection reused |
| Cache-aside | org/project services | Redis first, DB on miss |
| Decorator | Express middleware | authenticate → checkPermission → handler |
