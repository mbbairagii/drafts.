# drafts.

> *Your thoughts deserve somewhere beautiful to live.*

***

## What is this?

**drafts.** is a digital diary that actually feels like one. Not a notes app, not a markdown editor — a real book you open, flip through, and write in. Your entries can be typed, drawn, stamped with stickers, filled with photos, or written in your own handwriting turned into a font.

It started as a personal project. It turned into something I'm genuinely proud of.

***

## What can you do with it?

### 🏠 Landing Page
A cinematic first impression — atmospheric, animated, sets the tone before you even log in.

### 🔐 Auth
- Signup and login with JWT authentication
- Each diary can have its own password — bcrypt-encrypted, fully private

### 📚 Dashboard
- All your diaries in one place
- Create a new one with a custom name, cover style, and optional lock
- Each card shows the cover, name, and when you last wrote in it

### 📖 Diary Editor
- A realistic book — it opens with a cover flip, pages turn, the spine sits there looking pretty
- Multiple pages per diary, add or delete as you go
- Page themes: lined, grid, dot grid, plain

### ✏️ Canvas Editor
- **Pen** — smooth ink strokes
- **Pencil** — grainy, natural texture
- **Highlighter** — multiply blend mode so it actually looks like a highlighter
- **Eraser** — proper destination-out compositing, not just painting white
- **Text tool** — click anywhere on the page, start typing
- **Image upload** — drag and reposition photos wherever you want
- **Stickers** — emoji and a sticker library, drag/resize/rotate freely

### ✍️ Handwriting Font Pipeline
This is the part I'm most proud of. You can write in your *actual* handwriting:
- Download a 62-character template (a–z, A–Z, 0–9)
- Fill it in with a pen, photograph it, upload it
- The system segments every glyph, vectorises it, normalises proportions using median ink height per character category, and compiles a real **OpenType `.ttf` font**
- That font gets injected live — every word you type in the diary now looks like *you* wrote it

### 💾 Saving
- Auto-saves as you go (debounced)
- Manual save button if you're the anxious type (I am)

***

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, TypeScript, Vite, React Router |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Drawing | HTML5 Canvas API |
| Font Pipeline | sharp, potrace, opentype.js |
| Deployment | Vercel (client), Render (server), MongoDB Atlas |

***

## Running it locally

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)

### Install

```bash
git clone https://github.com/mbbairagii/drafts..git
cd drafts-app
```

```bash
cd server && npm install
cd ../client && npm install
```

### Environment Variables

`server/.env`:
```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
PORT=5001
```

`client/.env.development`:
```env
VITE_API_URL=http://localhost:5000
```

### Start

```bash
# backend
cd server && npm run dev

# frontend
cd client && npm run dev
```

Open `http://localhost:5173`

***

## Deployment

| Service | Purpose |
|---|---|
| [Vercel](https://vercel.com) | Frontend — root dir: `client/` |
| [Render](https://render.com) | Backend — root dir: `server/` |
| [MongoDB Atlas](https://cloud.mongodb.com) | Database |

Set `VITE_API_URL` on Vercel and all `.env` vars on Render. Atlas Network Access should allow `0.0.0.0/0`.
