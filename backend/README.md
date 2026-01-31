# OmniConnect Backend

Quick start (development):

1. Copy `.env` values or set environment variables:

- `MONGO_URI` (default: `mongodb://127.0.0.1:27017/omnicconnect`)
- `JWT_SECRET`
- `PORT` (optional)

2. Install dependencies and run:

```powershell
cd backend
npm install
npm run dev
```

API overview:

- `POST /api/auth/signup` - manager signup
- `POST /api/auth/login` - manager login
- `POST /api/workspaces` - create workspace (authenticated)
- `GET /api/workspaces` - list manager's workspaces (authenticated)
- `GET /api/public/search?q=...` - search workspaces (public)
- `POST /api/public/join` - submit join request (public)
- `POST /api/announcements` - create and dispatch announcement (authenticated)

Notification dispatch is mocked in `services/notificationService.js` and logs are stored in MongoDB `DeliveryLog` collection.
