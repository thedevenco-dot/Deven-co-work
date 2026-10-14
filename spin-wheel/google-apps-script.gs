/**
 * Google Apps Script Web App for Deven Co-Work "Spin Wheel Leads" Sync
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.new) and create or open your destination sheet.
 * 2. In the menu, go to Extensions -> Apps Script.
 * 3. Delete any default code in Code.gs and paste this entire file.
 * 4. (Optional) Set your secret token in Project Settings -> Script Properties:
 *    Property: SPIN_SHEET_SECRET
 *    Value: (Your secret key, matching process.env.SPIN_SHEET_SECRET on Render)
 *    Alternatively, define EXPECTED_SECRET directly below.
 * 5. Click "Deploy" -> "New deployment" -> Select type "Web app".
 *    - Description: "Spin Wheel Leads Sync Webhook"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 6. Copy the Web App URL and set it as SPIN_SHEET_WEBHOOK_URL in your backend host environment.
 */

const EXPECTED_SECRET = ''; // Optional fallback secret if Script Properties are not configured

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    message: 'Deven Co-Work Spin Wheel Webhook is active.',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const rawData = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const payload = JSON.parse(rawData);

    // Verify secret token
    const scriptSecret = PropertiesService.getScriptProperties().getProperty('SPIN_SHEET_SECRET') || EXPECTED_SECRET;
    if (scriptSecret && scriptSecret.trim().length > 0) {
      if (!payload.secret || payload.secret !== scriptSecret) {
        return ContentService.createTextOutput(JSON.stringify({
          ok: false,
          error: 'Unauthorized: Invalid or missing secret'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Spin Wheel Leads');

    // Create sheet with styled header if it does not exist
    if (!sheet) {
      sheet = ss.insertSheet('Spin Wheel Leads');
      const headers = ['Date', 'Name', 'Phone', 'Preferred Date', 'Reward', 'Coupon Code', 'Valid Till'];
      sheet.appendRow(headers);

      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#04B8BB');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      headerRange.setFontSize(11);
      sheet.setFrozenRows(1);

      // Auto-set initial column widths
      sheet.setColumnWidth(1, 180); // Date
      sheet.setColumnWidth(2, 180); // Name
      sheet.setColumnWidth(3, 130); // Phone
      sheet.setColumnWidth(4, 130); // Preferred Date
      sheet.setColumnWidth(5, 260); // Reward
      sheet.setColumnWidth(6, 140); // Coupon Code
      sheet.setColumnWidth(7, 130); // Valid Till
    }

    // Prepare row values (format phone as text by prefixing with apostrophe)
    const phoneText = payload.phone ? "'" + String(payload.phone).replace(/\D/g, '') : '';
    const row = [
      payload.date || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      payload.name || '',
      phoneText,
      payload.preferredDate || '',
      payload.reward || '',
      payload.couponCode || '',
      payload.expiresAt || ''
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      rowAppended: true
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
