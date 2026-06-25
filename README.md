# Zhifan

Company website for Ningbo Zhifan Welding Materials Co., Ltd.

React + Vite frontend, Node.js + Express backend, MongoDB for customer inquiry storage.

## Local development

```powershell
npm install
Copy-Item .env.example .env
npm run dev
npm run server
```

Frontend: http://localhost:5173
Backend: http://localhost:3000

## Environment

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/zhifan_welding
ADMIN_TOKEN=change-this-token
NODE_ENV=production
```

## Production

```powershell
npm install
npm run build
npm start
```

Public endpoints:
- GET /api/health
- POST /api/inquiries

Admin inquiry list:
- GET /api/inquiries
- Header: x-admin-token: your-token
## Admin page

Open `/admin`, enter `ADMIN_TOKEN`, then click the query button to view customer inquiries stored in MongoDB.

Direct MongoDB shell access on the server:

```bash
mongosh "mongodb://127.0.0.1:27017/zhifan_welding"
db.inquiries.find().sort({ createdAt: -1 }).limit(20).pretty()
```