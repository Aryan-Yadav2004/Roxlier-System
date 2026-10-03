# Store Rating Platform — Architecture Plan

## Folder Structure

```
roxlier-system/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, env, constants
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, validation, error
│   │   ├── models/          # DB query functions (no ORM)
│   │   ├── routes/          # Express routers
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helpers (jwt, hash, etc.)
│   │   └── validators/      # Joi/Zod validators
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/             # Axios instances & API calls
    │   ├── components/      # Reusable UI components
    │   ├── context/         # Auth context
    │   ├── hooks/           # Custom hooks
    │   ├── pages/
    │   │   ├── auth/        # Login, Register
    │   │   ├── admin/       # Admin dashboard, users, stores
    │   │   ├── user/        # Store listing, ratings
    │   │   └── owner/       # Owner dashboard
    │   ├── routes/          # Protected route guards
    │   └── utils/           # Helpers
    ├── .env
    └── package.json
```

## DB Schema

### users
- id (UUID PK)
- name (VARCHAR 60)
- email (VARCHAR UNIQUE)
- password (hashed)
- address (VARCHAR 400)
- role (ENUM: admin, user, store_owner)
- created_at, updated_at

### stores
- id (UUID PK)
- name (VARCHAR 60)
- email (VARCHAR UNIQUE)
- address (VARCHAR 400)
- owner_id (FK -> users.id)
- created_at, updated_at

### ratings
- id (UUID PK)
- user_id (FK -> users.id)
- store_id (FK -> stores.id)
- rating (INTEGER 1-5)
- created_at, updated_at
- UNIQUE(user_id, store_id)

### refresh_tokens
- id (UUID PK)
- user_id (FK -> users.id)
- token (TEXT UNIQUE)
- expires_at (TIMESTAMP)
- created_at

## Auth Flow
- POST /auth/login → returns access_token (15min) + refresh_token (7d)
- POST /auth/refresh → exchange refresh_token for new access_token
- POST /auth/logout → invalidate refresh_token in DB
