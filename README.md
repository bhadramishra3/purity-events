# Purity Events & Decorations — Website

A full-stack website for Purity Events, a Columbus, Ohio event decoration business.

---

## Project structure

```
Purity Events Website/
├── frontend/          React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── pages/     One file per page (Home, Packages, Booking, etc.)
│   │   ├── components/  Navigation and shared UI
│   │   └── context/   Auth (login/logout, API client)
│   └── public/
│       └── contract-builder.html   Standalone contract tool (no login needed)
└── backend/           Node.js + Express + MongoDB
    ├── routes/        API endpoints (auth, bookings, gallery, clients)
    ├── models/        MongoDB schemas
    ├── middleware/    Auth guard, file upload (multer)
    └── uploads/       Photos stored here (not committed to git)
```

---

## Running locally

```bash
# Terminal 1 — backend
cd backend
npm install
npm run dev          # starts on port 5001

# Terminal 2 — frontend
cd frontend
npm install
npm run dev          # starts on port 5173, proxies /api → 5001
```

You also need MongoDB running locally:
```bash
brew services start mongodb-community
```

---

## How to make common edits

### Add a new page to the website

1. Create `frontend/src/pages/YourPage.jsx`
2. In [App.jsx](frontend/src/App.jsx), import it and add a `<Route path="/your-path" element={<YourPage />} />`
3. To add it to the navigation bar, open [Navigation.jsx](frontend/src/components/Navigation.jsx) and add it to the `navLinks` array at the top

### Change the navigation links

Open [Navigation.jsx](frontend/src/components/Navigation.jsx) — the `navLinks` array at the top (lines 5–9) controls what appears in the nav bar:
```js
const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Packages', to: '/packages' },
  { label: 'Book Now', to: '/booking' },
  // Add more here: { label: 'Gallery', to: '/gallery' }
];
```

### Add or change event packages / pricing

Open [Packages.jsx](frontend/src/pages/Packages.jsx). The packages are defined as a `PACKAGES` array near the top of the file. Each package has a `name`, `price`, `description`, and `features` list. Edit those values — no backend change needed.

### Add photos to the gallery

Log in as admin → go to `/admin` → open the **Gallery** tab → drag and drop photos. They upload to `backend/uploads/gallery/` and are saved to the database.

- Photos are served at `http://localhost:5001/uploads/gallery/filename.jpg`
- Supported formats: JPG, PNG, WebP, GIF (max 15 MB each)
- **Important for production:** uploaded photos are stored on the server disk. If you redeploy on Render, they will be wiped. For permanent storage, migrate to Cloudinary (ask Claude for help when ready).

### Show or hide the gallery page for the public

In [App.jsx](frontend/src/App.jsx) line 50, change:
```jsx
<Route path="/gallery" element={<Navigate to="/" replace />} />
```
to:
```jsx
<Route path="/gallery" element={<Gallery />} />
```
And in [Navigation.jsx](frontend/src/components/Navigation.jsx), add `{ label: 'Gallery', to: '/gallery' }` to `navLinks`.

### Change contact info / footer text

Search for `614-555` or `hello@purity` in the frontend `src/` folder to find where placeholder contact info lives and replace it with your real phone and email.

### Add a new event type to the gallery filter or contract builder

**Gallery filter** — open [Gallery.jsx](frontend/src/pages/Gallery.jsx) and add your new type to the `EVENT_TYPES` array at the top (line 4).

**Contract builder** — open [frontend/public/contract-builder.html](frontend/public/contract-builder.html), find `SECTION: CONFIG` (search Cmd+F), and edit `CONFIG.eventTypes`.

### Change contract builder options (packages, items, legal wording)

Open [contract-builder.html](frontend/public/contract-builder.html) and search for `SECTION: CONFIG`. Everything you'd ever want to edit is in that one block:

| What you want to change | Where in CONFIG |
|---|---|
| Event type dropdown | `CONFIG.eventTypes` |
| Decor package dropdown | `CONFIG.decorPackages` |
| Line-item options per contract | `CONFIG.itemOptions` |
| Deposit clause wording | `CONFIG.clauses.deposit` |
| Damage clause wording | `CONFIG.clauses.damage` |
| Liability clause wording | `CONFIG.clauses.liability` |
| Default role / responsibilities text | `CONFIG.clauses.defaultRole` |

The contract builder is accessible at `/contract-builder.html` (directly from the browser, no login). It's linked from the Admin Panel → Quick Setup tab.

### Add a new field to client bookings

1. **Backend model** — open [backend/models/Client.js](backend/models/Client.js) and add the field to the Mongoose schema
2. **Backend route** — open [backend/routes/bookings.js](backend/routes/bookings.js) and make sure the new field is accepted in the POST/PUT handlers
3. **Frontend form** — open [frontend/src/pages/Booking.jsx](frontend/src/pages/Booking.jsx) and add an input for the field
4. **Admin view** — open [frontend/src/pages/AdminDashboard.jsx](frontend/src/pages/AdminDashboard.jsx) and display it in the booking row

### Change the color scheme

The site uses a custom Tailwind theme. Colors are defined in [frontend/tailwind.config.js](frontend/tailwind.config.js). The main ones used throughout:
- `gold-*` — the primary brand gold (buttons, accents)
- `charcoal` — dark text / dark backgrounds
- `cream-*` — warm off-white backgrounds
- `burgundy-*` — admin / alert accent

### Add a logo image

Put your logo file in `frontend/public/` (e.g. `logo.png`). Then reference it in [Navigation.jsx](frontend/src/components/Navigation.jsx) — find the logo `<div>` around line 64 and replace the gold circle with:
```jsx
<img src="/logo.png" alt="Purity Events" className="h-10 w-auto" />
```

---

## Backend API routes

| Method | Path | What it does |
|---|---|---|
| POST | `/api/auth/register` | Create client account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/bookings` | List bookings (admin: all, client: own) |
| POST | `/api/bookings` | Create a booking |
| PUT | `/api/bookings/:id` | Update booking (admin) |
| DELETE | `/api/bookings/:id` | Delete booking (admin) |
| GET | `/api/gallery` | List gallery images (paginated, filterable) |
| POST | `/api/gallery/upload` | Upload a photo (admin only) |
| DELETE | `/api/gallery/:id` | Delete a photo (admin only) |
| PATCH | `/api/gallery/:id/view` | Increment view count |

All protected routes require `Authorization: Bearer <token>` header. The frontend's `api` client (from AuthContext) sets this automatically.

### Add a new backend route

1. Create or open a file in `backend/routes/` (e.g. `backend/routes/invoices.js`)
2. Define your Express router and export it
3. In [backend/server.js](backend/server.js), add: `app.use('/api/invoices', require('./routes/invoices'))`

---

## Deployment

### Frontend → Vercel
1. Push to GitHub
2. Import repo at vercel.com → root directory: `frontend`
3. Build command: `npm run build`, output: `dist`
4. Add env var: `VITE_API_URL=https://your-render-backend.onrender.com`

### Backend → Render
1. New Web Service → connect GitHub repo → root: `backend`
2. Build: `npm install`, Start: `node server.js`
3. Add env vars: `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NODE_ENV=production`

### Database → MongoDB Atlas
1. Create free cluster at mongodb.com/atlas
2. Add your Render server's IP to the allowlist (or use 0.0.0.0/0 for all)
3. Copy the connection string into `MONGO_URI` on Render

---

## Environment variables

**backend/.env**
```
MONGO_URI=mongodb://localhost:27017/purity-events
JWT_SECRET=your-secret-key
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=yourpassword
PORT=5001
NODE_ENV=development
GOOGLE_CLIENT_ID=         # optional, for Google login
GOOGLE_CLIENT_SECRET=     # optional
FACEBOOK_APP_ID=          # optional, for Facebook login
FACEBOOK_APP_SECRET=      # optional
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5001
```
