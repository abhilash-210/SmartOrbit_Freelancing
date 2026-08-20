# SmartOrbit — Google Sheets Setup Guide

This guide explains how to connect **Google Sheets** to record all SmartOrbit leads automatically.

---

## 1. Create the Google Sheet

1. Go to [Google Sheets](https://sheets.new) and create a new spreadsheet.
2. Rename the spreadsheet to: **SmartOrbit Leads**
3. Rename the first sheet tab (at the bottom) to: **SmartOrbit Leads**
4. In the first row (**Row 1**), set the following headers across columns **A to M**:

| Col | Header Name | Description |
| :--- | :--- | :--- |
| **A** | `Lead ID` | Unique ID (e.g. `SO-20260820-0001`) |
| **B** | `Date` | Creation date (DD-MMM-YYYY) |
| **C** | `Time` | Creation time (hh:mm A) |
| **D** | `Client Name` | Client's WhatsApp name |
| **E** | `WhatsApp Number` | Full phone number with country code |
| **F** | `Service` | Selected service category |
| **G** | `Initial Message` | First message sent by client |
| **H** | `Source` | `website` or `direct_whatsapp` |
| **I** | `Entry Point` | `discuss_project_button` or `direct_message` |
| **J** | `Conversation State` | `HUMAN_HANDOFF` |
| **K** | `Lead Status` | Default `New` |
| **L** | `Last Contacted` | Empty for manual tracking |
| **M** | `Notes` | Empty for freelancer notes |

5. Copy the **Spreadsheet ID** from your browser address bar:
   `https://docs.google.com/spreadsheets/d/`**`<YOUR_SPREADSHEET_ID>`**`/edit`
   Save this as `GOOGLE_SHEETS_SPREADSHEET_ID`.

---

## 2. Google Cloud Service Account Setup

To allow the serverless backend to write rows to your Google Sheet without user popups:

### Step 2.1: Create Google Cloud Project & Enable Sheets API
1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `SmartOrbit Automation`.
3. In the search bar at top, search for **Google Sheets API** and click **Enable**.

### Step 2.2: Create Service Account
1. In the left navigation menu, go to **IAM & Admin** > **Service Accounts**.
2. Click **Create Service Account**.
3. Service account name: `smartorbit-sheets-writer`.
4. Click **Create and Continue**, then click **Done**.
5. Copy the generated **Service Account Email** (e.g. `smartorbit-sheets-writer@smartorbit-automation.iam.gserviceaccount.com`).
   Save this as `GOOGLE_SERVICE_ACCOUNT_EMAIL`.

### Step 2.3: Generate Private Key
1. Click on your newly created service account.
2. Go to the **Keys** tab > click **Add Key** > **Create new key**.
3. Select **JSON** > click **Create**.
4. A JSON file will download to your computer. Open it and copy:
   - `private_key` (the long string beginning with `-----BEGIN PRIVATE KEY-----\n...`).
   Save this as `GOOGLE_PRIVATE_KEY`.

---

## 3. Share the Google Sheet with the Service Account

1. Go back to your **SmartOrbit Leads** Google Sheet.
2. Click the green **Share** button in the top right.
3. Paste your **Service Account Email** (from Step 2.2).
4. Ensure the role is set to **Editor**.
5. Uncheck "Notify people" and click **Share**.

---

## 4. Verification Checklist

- [ ] Sheet created and named `SmartOrbit Leads`
- [ ] Headers added from A1 to M1
- [ ] Sheet shared with service account as **Editor**
- [ ] Environment variables saved:
  - `GOOGLE_SHEETS_SPREADSHEET_ID`
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
  - `GOOGLE_PRIVATE_KEY`
