# PlateMate Starter (Next.js + Express)

This is a minimal starter app combining Next.js and an Express custom server. It includes a tiny in-memory API for recipes and a few Next pages to browse and create recipes.

Run locally (macOS / zsh):

```bash
cd term_project
npm install
npm run dev
```

Open http://localhost:3000

Notes:
- This is a starter: file uploads are accepted but not persisted to disk.
- Data is stored in-memory (server restart clears it).

MongoDB integration
-------------------
The server supports persisting recipes to MongoDB using Mongoose. To enable it, set the environment variable `MONGODB_URI` to a valid connection string before starting the server. Example (macOS / zsh):

```bash
export MONGODB_URI="mongodb://localhost:27017/plate_mate"
npm run dev
```

If `MONGODB_URI` is not provided or connection fails, the server will fall back to the in-memory store.
