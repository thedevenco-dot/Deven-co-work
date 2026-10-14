# Spin the Wheel — Lead Generation Feature

Standalone, mobile-first "Spin the Wheel" promotion and lead-generation system for **Deven Co-Work** (Raipur).

---

## Architecture Overview

1. **Standalone Frontend (`/spin-wheel`)**: Single static HTML/CSS/JS file (`index.html`) using HTML5 canvas, responsive design matching the dark aesthetic of Deven Co-Work, zero external dependencies, deployable directly to Vercel or any static host.
2. **Backend API (`/server`)**: Node.js + Express API endpoints under `/api/spin-wheel` with cryptographically secure weighted random selection, JWT verification tokens, duplicate phone prevention, anti-abuse rate limiters, and Excel export.
3. **Database (`MongoDB`)**: Stores leads under `SpinWheelLead` collection with timestamps, visit dates, unique coupon codes, and redemption statuses.
4. **Admin Panel (`/admin`)**: Operations panel tab **"Spin Wheel Leads"** with live stats, search, filtering, status updates, staff notes, and one-click styled `.xlsx` spreadsheet download.
5. **Google Sheets Sync (`google-apps-script.gs`)**: Real-time webhook appending leads into a Google Sheet spreadsheet.

---

## 1. Server Setup & Dependencies

Excel export uses `exceljs`. Install dependencies in the server directory:

```bash
npm install --prefix server
```

Restart the server:

```bash
# In development (root):
npm run dev

# Or in production on Render:
npm start --prefix server
```

---

## 2. Setting Up Google Sheets Auto-Sync

Every spin wheel lead can automatically sync to a live Google Sheet:

1. Open [Google Sheets](https://sheets.new) and create a new blank spreadsheet. Name it **"Deven Co-Work — Spin Wheel Leads"**.
2. In the top menu, go to **Extensions** → **Apps Script**.
3. Replace all code in `Code.gs` with the contents of [`spin-wheel/google-apps-script.gs`](google-apps-script.gs).
4. (Optional) Set your secret token:
   - Click the gear icon (**Project Settings** ⚙️) on the left sidebar.
   - Under **Script Properties**, add:
     - **Property**: `SPIN_SHEET_SECRET`
     - **Value**: Any secure random string (e.g. `deven_spin_secret_928374`)
5. Click **Deploy** → **New deployment**:
   - Click the gear next to "Select type" and choose **Web app**.
   - **Description**: `Spin Wheel Leads Webhook`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
   - Click **Deploy** and authorize the script permissions.
6. Copy the **Web App URL** (ends in `/exec`).
7. In your backend host (e.g., Render Dashboard):
   - Set `SPIN_SHEET_WEBHOOK_URL` to your copied Web App URL.
   - Set `SPIN_SHEET_SECRET` to the same secret string chosen in step 4.

The sheet will automatically create the styled header (`Date | Name | Phone | Preferred Date | Reward | Coupon Code | Valid Till`) on the first incoming lead and append each lead as text.

---

## 3. Deploying `/spin-wheel` to Vercel

The `/spin-wheel` folder is designed to be deployed as an independent project on Vercel:

1. Go to your [Vercel Dashboard](https://vercel.com/new).
2. Import the `Deven-co-work` repository.
3. In the project setup screen:
   - **Project Name**: `deven-cowork-spin`
   - **Framework Preset**: `Other`
   - **Root Directory**: Click "Edit" and choose `spin-wheel`
   - **Build Command**: Leave empty / disabled (no build step needed)
   - **Output Directory**: Leave empty
4. Click **Deploy**.
5. Add Custom Domain:
   - In project **Settings** → **Domains**, add `spin.devencowork.com`.
   - In your DNS provider (Cloudflare, GoDaddy, Namecheap, etc.), add a CNAME record:
     - **Type**: `CNAME`
     - **Name / Host**: `spin`
     - **Value**: `cname.vercel-dns.com`

---

## 4. CORS & Backend Configuration

The Express backend in `server/app.js` is pre-configured to allow requests from:
- `https://spin.devencowork.com`
- `http://localhost:3000`
- `http://localhost:5000`
- Custom origins configured via `CORS_ALLOWED_ORIGIN` environment variable.

If testing locally on a different port, pass the query param `?api=http://localhost:5000/api` to `spin-wheel/index.html`.

---

## 5. Editing Offers, Chances, & Validity

All rewards, probability weights, and validity settings are centrally managed in a single editable file:

📂 [`server/config/spinWheelConfig.js`](../server/config/spinWheelConfig.js)

```javascript
export const spinWheelConfig = {
  couponPrefix: 'DEVEN',
  couponValidDays: 7,   // How many days coupons stay valid
  tokenTtl: '30m',       // JWT lifetime for claiming spin
  offers: [
    { id: 'free-tour',   label: 'Free Tour',                             short: 'Free Tour',     weight: 25, color: '#04B8BB', textColor: '#0A0A0A' },
    { id: 'trial-2d',    label: '2 Days Free Trial',                     short: '2 Days Free',   weight: 20, color: '#141416', textColor: '#F1F1F1' },
    { id: 'trial-7d',    label: '7 Days Free Trial',                     short: '7 Days Free',   weight: 5,  color: '#039DA0', textColor: '#0A0A0A' },
    { id: 'pro-shoot',   label: 'Free Professional Shot in our Studio',  short: 'Free Pro Shoot',weight: 10, color: '#1C1C20', textColor: '#F1F1F1' },
    { id: 'off-20',      label: '20% Discount on Booking Amount',        short: '20% Off',       weight: 15, color: '#04B8BB', textColor: '#0A0A0A' },
    { id: 'off-30-team', label: '30% Discount on Team Booking',          short: '30% Team Off',  weight: 5,  color: '#141416', textColor: '#F1F1F1' },
    { id: 'event-pass',  label: 'Passes to Free Workshops & Events',     short: 'Event Passes',  weight: 20, color: '#028588', textColor: '#FFFFFF' },
  ],
  instructions: [ ... ],
  contact: { ... },
  address: { ... }
};
```

- **Weights**: Relative chances (e.g. weight 25 out of 100 = 25% probability). The client never sees weights.
- Changes take effect as soon as the server restarts.

---

## 6. Verification & Test Checklist

- [x] **GET /api/spin-wheel/config**: Returns offers with colors & labels, instructions, contact, address (no weights).
- [x] **POST /api/spin-wheel/spin**: Returns segment index, offer label, and signed JWT session token. Rate-limited to 10 spins/hour per IP.
- [x] **POST /api/spin-wheel/leads**:
  - Validates name (>= 2 chars), Indian mobile number (normalised to 10 digits starting with 6–9), and visit date (within 60 days).
  - Enforces single reward per mobile number (returns HTTP 409 if already claimed).
  - Enforces single claim per spin session ID.
  - Generates coupon code `DEVEN-XXXXXX` valid for 7 days.
- [x] **Frontend Flow (`/spin-wheel/index.html`)**:
  - Smooth 5.2s canvas animation resting on the winning segment with safe middle-70% segment offset.
  - Form validation with inline error feedback.
  - Voucher screen with copy-to-clipboard, WhatsApp link, and Google Maps directions link.
  - LocalStorage check (`deven_spin_claim`): Returning visitors see their claimed voucher directly.
- [x] **Admin Panel (`/admin`)**:
  - Sidebar item: **Spin Wheel Leads** under Operations group.
  - Stat cards: Total Leads, Redeemed Count, Reward breakdown.
  - Search by name, phone, coupon code; filter by status and reward.
  - View modal: Edit status (`ISSUED`, `CONTACTED`, `REDEEMED`) and add internal staff notes.
  - Export to Excel: Downloads styled `.xlsx` file with teal bold header, frozen top row, and text-formatted phone numbers.
- [x] **Google Sheet Sync**: Automatically posts row payload to `SPIN_SHEET_WEBHOOK_URL` without blocking user response.
