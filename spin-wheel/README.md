# Spin the Wheel — Setup & Deployment Guide

Standalone, mobile-first "Spin the Wheel" promotion and lead-generation feature for **Deven Co-Work**.

---

## 1. Environment Variables

| Variable | Platform | Status | Description |
| :--- | :--- | :--- | :--- |
| *(None)* | **Vercel** (`spin-wheel` project) | *Not needed* | The frontend is a static web app; no environment variables are needed on Vercel. |
| `JWT_SECRET` | **Render** (Backend Host) | **Required** | Used for cryptographically signing short-lived spin verification tokens. (Already configured on Render). |
| `SPIN_SHEET_WEBHOOK_URL` | **Render** (Backend Host) | *Optional* | The Google Apps Script Web App URL where new lead rows are automatically appended. |
| `SPIN_SHEET_SECRET` | **Render** (Backend Host) | *Optional* | Shared secret between the Express backend and the Apps Script webhook. Must match `SPIN_SHEET_SECRET` in Google Apps Script Script Properties. |
| `CORS_ALLOWED_ORIGIN` | **Render** (Backend Host) | *Optional* | Extra allowed origin. Note: `https://spin.devencowork.com` is already permanently allowed in backend code. |

---

## 2. Generate a Strong Shared Secret

To generate a secure 48-character random hex token for `SPIN_SHEET_SECRET`, run:

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

Save this value: it will be pasted into **both** Render and Google Apps Script.

---

## 3. Google Sheet Setup (Automatic Lead Sync)

1. Open [Google Sheets](https://sheets.new) and create a new blank spreadsheet (e.g. **"Deven Co-Work — Spin Wheel Leads"**).
2. In the top navigation bar, click **Extensions** → **Apps Script**.
3. Clear out any default code in the editor, and paste the entire contents of [`spin-wheel/google-apps-script.gs`](google-apps-script.gs).
4. Configure the shared secret:
   - Click the gear icon (**Project Settings** ⚙️) on the left sidebar.
   - Scroll down to the **Script Properties** section.
   - Click **Edit script properties** → **Add script property**.
   - **Property**: `SPIN_SHEET_SECRET`
   - **Value**: (Paste the exact same secret generated in step 2).
   - Click **Save script properties**.
5. Deploy as Web App:
   - Click **Deploy** (top right) → **New deployment**.
   - Click the gear icon next to "Select type" and select **Web app**.
   - **Description**: `Spin Wheel Leads Webhook`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
   - Click **Deploy** and grant standard Google authorization permissions.
6. Copy the generated **Web App URL** (ends in `/exec`).
7. In your **Render Dashboard** (for the backend service):
   - Add `SPIN_SHEET_WEBHOOK_URL` = `<your copied /exec URL>`.
   - Add `SPIN_SHEET_SECRET` = `<your secret string from step 2>`.

> [!IMPORTANT]
> Whenever you edit `google-apps-script.gs` in the future, you must click **Deploy** → **Manage deployments** → **Edit** and deploy as a **NEW VERSION** for changes to take effect.

---

## 4. Redeploying / Restarting on Render

After adding or updating environment variables (`SPIN_SHEET_WEBHOOK_URL`, `SPIN_SHEET_SECRET`, etc.) in the Render dashboard:
- Render will usually trigger an automatic redeploy. If not, click **Manual Deploy** → **Deploy latest commit** or **Restart Service** so the running process picks up the new environment variables.

---

## 5. Vercel Deployment

Deploy `/spin-wheel` as a separate static project on Vercel:

1. Go to your [Vercel Dashboard](https://vercel.com/new).
2. Select your repository: `Deven-co-work`.
3. In the project configuration:
   - **Project Name**: `deven-cowork-spin`
   - **Framework Preset**: `Other`
   - **Root Directory**: Click "Edit" and choose `spin-wheel`
   - **Build Command**: *Leave blank / disabled* (pure static HTML/CSS/JS)
   - **Output Directory**: *Leave blank*
4. Click **Deploy**.
5. Custom Domain Configuration:
   - Go to Project **Settings** → **Domains**.
   - Add `spin.devencowork.com`.
   - In your DNS provider (Cloudflare, GoDaddy, Namecheap), add the DNS record:
     - **Type**: `CNAME`
     - **Name**: `spin`
     - **Value**: `cname.vercel-dns.com`

---

## 6. Quick Test Checklist

- [ ] **Spin**: Click SPIN on the wheel; the wheel spins for ~5.2 seconds and rests smoothly on the winning segment.
- [ ] **Form**: Fill in Full Name, 10-digit mobile number, and visit date; click "Claim My Reward".
- [ ] **Coupon**: The voucher screen displays `DEVEN-XXXXXX` with the 7-day expiry date and copy-to-clipboard functionality.
- [ ] **Admin Panel**: Log into `https://devencowork.com/admin` (or `http://localhost:3000/admin`), click **Operations → Spin Wheel Leads**, and confirm the lead is listed with status `ISSUED`.
- [ ] **Excel Export**: Click "Export to Excel" in the admin panel and confirm a styled `.xlsx` file downloads.
- [ ] **Google Sheet**: If `SPIN_SHEET_WEBHOOK_URL` is set, confirm a new row appears in the "Spin Wheel Leads" tab.
- [ ] **Anti-Abuse / Duplicate Prevention**: Attempt to claim again with the same mobile number; verify it is rejected with "This mobile number has already claimed a reward coupon."
