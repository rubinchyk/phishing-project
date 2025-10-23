# Frontend Guide — Phishing Simulation Dashboard

## Overview
React-based web application with Apple-style UI for managing phishing simulations. Built with TypeScript, React Router, and Axios.

## Features
- ✅ **JWT Authentication** — Secure login and registration
- ✅ **Protected Routes** — Dashboard accessible only to authenticated users
- ✅ **Send Phishing Emails** — Form to trigger phishing attempts
- ✅ **View Attempts Table** — Real-time list of all phishing attempts with status tracking
- ✅ **Apple-Style Design** — Clean, minimalist UI with smooth animations

## Tech Stack
- **React 18** + TypeScript
- **React Router** — Client-side routing
- **Axios** — API communication
- **Vite** — Build tool
- **NGINX** — Production server

## Project Structure
```
frontend/
├── src/
│   ├── api/
│   │   └── client.ts          # Axios client + API methods
│   ├── components/
│   │   └── ProtectedRoute.tsx # Route guard
│   ├── context/
│   │   └── AuthContext.tsx    # Auth state management
│   ├── pages/
│   │   ├── Login.tsx          # Login page
│   │   ├── Register.tsx       # Registration page
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── Auth.css           # Auth pages styles
│   │   └── Dashboard.css      # Dashboard styles
│   ├── App.tsx                # Router setup
│   └── index.css              # Global styles (Apple design system)
└── Dockerfile                 # Production build
```

## Environment Variables
The frontend reads `VITE_API_URL` from the environment:
- **Development:** `http://localhost:3000`
- **Production (Docker):** Set via `REACT_APP_API_URL` in `.env` (mapped to `VITE_API_URL` at build time)

## Development

### Start dev server
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

### Build for production
```bash
npm run build
```
Output: `dist/` folder

## Production (Docker)

### Build and run
```bash
# From project root
docker compose build frontend
docker compose up -d frontend
```

Frontend available at: **http://localhost:8080**

## API Integration

### Endpoints used
- `POST /auth/register` — Create new admin account
- `POST /auth/login` — Authenticate and get JWT token
- `GET /attempts` — Fetch all phishing attempts (requires JWT)
- `POST /attempts/send` — Send phishing email (requires JWT)

### Authentication Flow
1. User registers or logs in
2. JWT token stored in `localStorage`
3. Token automatically attached to all API requests via Axios interceptor
4. On 401 response, user redirected to login

## User Flow

### 1. Registration/Login
- Navigate to `/register` or `/login`
- Enter email and password
- On success, redirected to `/dashboard`

### 2. Dashboard
- **Send Phishing Email:**
  - Enter recipient email (required)
  - Optionally add subject and content
  - Click "Send Phishing Email"
  - Success message displayed
  - Table auto-refreshes

- **View Attempts:**
  - Table shows all attempts with:
    - Recipient email
    - Subject
    - Status badge (pending/sent/clicked/failed)
    - Sent timestamp
    - Clicked timestamp (if applicable)

### 3. Logout
- Click "Sign Out" button in header
- Redirected to login page

## Design System (Apple Style)

### Colors
- **Primary Blue:** `#007AFF`
- **Success Green:** `#34C759`
- **Error Red:** `#FF3B30`
- **Gray:** `#8E8E93`
- **Light Gray:** `#F2F2F7`
- **Border:** `#E5E5EA`

### Typography
- **Font:** SF Pro Display / SF Pro Text (system fallback)
- **Weights:** 400 (regular), 500 (medium), 600 (semibold)

### Components
- **Buttons:** Rounded (12px), smooth hover transitions
- **Inputs:** Rounded (10-12px), blue focus ring
- **Cards:** White background, subtle shadow, 16-20px border radius
- **Status Badges:** Colored backgrounds with matching text

## Validation & Error Handling

### Client-side validation
- Email format check
- Password length (min 6 characters)
- Password confirmation match

### API error handling
- Network errors displayed in error message
- 401 responses trigger automatic logout
- User-friendly error messages for all failures

## Testing Checklist

- [ ] Register new account
- [ ] Login with existing account
- [ ] Protected route redirects unauthenticated users
- [ ] Send phishing email with all fields
- [ ] Send phishing email with only email (optional fields empty)
- [ ] View attempts table updates after sending
- [ ] Status badges display correctly
- [ ] Logout clears token and redirects
- [ ] Refresh page maintains auth state

## Troubleshooting

### "Network Error" on API calls
- Check `VITE_API_URL` is set correctly
- Verify management server is running on port 3000
- Check CORS settings if needed

### Blank page after build
- Ensure `dist/` folder contains `index.html` and assets
- Check NGINX config serves SPA correctly (try_files fallback)

### Token not persisting
- Check browser localStorage
- Verify JWT is not expired (7 days validity)

## Future Enhancements
- [ ] Dark mode support
- [ ] Real-time updates (WebSocket)
- [ ] Filtering and sorting attempts table
- [ ] Export attempts to CSV
- [ ] Email templates library
- [ ] Analytics dashboard
