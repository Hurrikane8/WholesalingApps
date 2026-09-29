/**
 * Aurora Home Buyers: free backup of every lead, buyer signup and opt-out
 * in a Google Sheet. Setup steps: docs/integrations/README.md.
 *
 * The website posts each record as JSON to this web app (LEAD_WEBHOOK_URL).
 * It appends one row per record to the tab for its type, creating the tab
 * and its header row if they're missing. Apps Script can't read custom
 * headers, so the URL carries a secret: ...?secret=YOUR_SECRET
 */

// Change this to a long random string, and put the same value in the URL you
// give the website (…/exec?secret=THE_SAME_STRING).
var SECRET = "CHANGE-ME-to-a-long-random-string";

var TABS = {
  seller_lead: "Seller leads",
  buyer_signup: "Buyers",
  opt_out: "Opt-outs",
};

var HEADERS = ["Received", "ID", "Address", "Name", "Phone", "Email", "Property type", "Timeline", "Reason", "Notes", "Full record (JSON)"];

function doPost(e) {
  if (!e || !e.parameter || e.parameter.secret !== SECRET) {
    return json_({ ok: false, error: "unauthorized" });
  }

  var record;
  try {
    record = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: "invalid JSON" });
  }

  var tabName = TABS[record.type] || "Other";
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tabName);
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(tabName);
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([
      record.receivedAt || new Date().toISOString(),
      record.id || "",
      record.address || "",
      record.name || "",
      record.phone || "",
      record.email || "",
      record.propertyType || (record.propertyTypes || []).join(", "),
      record.timeline || "",
      record.reason || record.channel || "",
      record.notes || "",
      JSON.stringify(record),
    ]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

function json_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
