# How to test email sending (Ethereal) — checklist

This document explains how to verify email sending for the **phishing-simulation-server** using Ethereal (dev SMTP). Follow the steps in order. All commands assume you run them from the project root (`phishing-project/`).

---

## 1 — Update SMTP variables in `.env`

Open `.env` and replace the SMTP block with the Ethereal credentials you created.

Example (fill with your Ethereal values):

```env
# Simulation server
SIM_PORT=3001
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=elisa92@ethereal.email        # replace with your ethereal username
SMTP_PASS=AH5B4arD8ydd2sEq6d           # replace with your ethereal password
FROM_EMAIL=no-reply@yourdomain.com
BASE_URL=http://localhost:3001
```

> Tip: Setting `FROM_EMAIL` equal to the Ethereal username is fine for testing.

---

## 2 — Restart Docker so services pick up new env

Stop and start your stack:

```bash
# stop
make down

# start in detached mode
make upd
```

Or:

```bash
docker compose down
docker compose up --build -d
```

Check logs:

```bash
make logs
# or logs for the simulation service:
docker compose logs -f phishing-simulation
```

---

## 3 — Send a test email (call simulation server directly)

Send a test email to any address (Ethereal will capture it):

```bash
curl -X POST http://localhost:3001/phishing/send   -H "Content-Type: application/json"   -d '{
    "email":"victim@example.com",
    "subject":"Test phishing",
    "body":"This is a test. Please click the link.",
    "simulationId":"test-uuid-1234"
  }'
```

Expected:
- The simulation server should return a success response.
- The server logs may include Nodemailer info or a `previewUrl` if using a test account.

If the request fails, inspect simulation logs:

```bash
docker compose logs -f phishing-simulation
```

---

## 4 — View the message in Ethereal web UI

1. Open https://ethereal.email  
2. Click **Open Mailbox** (or log in).
3. Use your Ethereal `SMTP_USER` and `SMTP_PASS` to log in.
4. Open the test message in the Ethereal inbox.
5. Inspect the HTML and find the link. It should point to:
   ```
   http://localhost:3001/phishing/click?simulationId=test-uuid-1234
   ```

---

## 5 — (Alternative) Use Nodemailer preview URL

If your MailService uses `nodemailer.createTestAccount()` or logs `nodemailer.getTestMessageUrl(info)`, your API response or logs may include a `previewUrl`. Open that URL in a browser to inspect the message.

Add this log in development to print the preview URL:

```js
console.log('previewUrl:', nodemailer.getTestMessageUrl(info));
```

---

## 6 — Simulate the user clicking the phishing link

Open the click URL in your browser (or use curl):

```bash
# browser:
http://localhost:3001/phishing/click?simulationId=test-uuid-1234

# or curl:
curl "http://localhost:3001/phishing/click?simulationId=test-uuid-1234"
```

Expected:
- The simulation server returns a simple HTML page (thank-you / safe page) or a redirect.
- The attempt record in Mongo should be updated to `status: "clicked"` (or similar).

---

## 7 — Verify attempt status via Management API

If `GET /attempts` is protected by JWT:

1. Register & login to get a token:

```bash
# Register
curl -X POST http://localhost:3000/auth/register   -H "Content-Type: application/json"   -d '{"email":"admin@local","password":"Test123!"}'

# Login
curl -X POST http://localhost:3000/auth/login   -H "Content-Type: application/json"   -d '{"email":"admin@local","password":"Test123!"}'
# Response contains { "token": "..." }
```

2. Fetch attempts:

```bash
curl -X GET http://localhost:3000/attempts   -H "Authorization: Bearer <YOUR_JWT>"
```

Look for the record with `simulationId: "test-uuid-1234"` and `status: "clicked"`.

---

## 8 — Check directly in Mongo (optional)

```bash
docker compose exec mongo mongosh

# in mongosh
use phishing_db
db.attempts.find({ simulationId: "test-uuid-1234" }).pretty()
```

You should see `status` updated to `clicked` and timestamps updated.

---

## 9 — Troubleshooting checklist

- **No messages in Ethereal inbox**
  - Confirm `SMTP_USER` and `SMTP_PASS` match Ethereal account.
  - Confirm simulation server successfully executed `sendMail` (check logs).
  - If you used a programmatic test account, ensure you used the same credentials returned by `createTestAccount()`.

- **`nodemailer.getTestMessageUrl(info)` returns `null`**
  - That happens when you use a real SMTP provider; preview URLs are only for Ethereal/test accounts.

- **Authentication errors**
  - Re-check credentials for stray whitespace or copy-paste mistakes.
  - Restart the container after editing `.env`.

- **BASE_URL points incorrectly**
  - Ensure `BASE_URL=http://localhost:3001` so links in emails point to the simulation service.

- **Click handler does not update DB**
  - Verify `/phishing/click` reads `simulationId` from the query and updates the correct collection.
  - Check simulation server logs for errors during the click.

---

## 10 — Recommended dev improvement (optional)

Make MailService dev-friendly:
- If `SMTP_USER` is empty, call `nodemailer.createTestAccount()` and use returned credentials.
- Always log `nodemailer.getTestMessageUrl(info)` in development.

This provides zero-config testing and immediate preview URLs.

---

## 11 — Quick summary (copy/paste run)

```bash
# 1) update .env with Ethereal credentials
# 2) restart stack
make down
make upd

# 3) send test email
curl -X POST http://localhost:3001/phishing/send   -H "Content-Type: application/json"   -d '{"email":"victim@example.com","subject":"Test","body":"click","simulationId":"test-uuid-1234"}'

# 4) open Ethereal mailbox or previewUrl -> click link
# 5) check management API:
curl -X GET http://localhost:3000/attempts -H "Authorization: Bearer <YOUR_JWT>"
```
