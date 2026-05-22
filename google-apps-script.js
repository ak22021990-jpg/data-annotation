/**
 * Email Abuse Annotation Test - Google Apps Script Backend
 *
 * Deploys as a Web App to handle test submissions and reviewer reports.
 * Reuses GAS patterns from sibling flagmail1 project.
 */

// Shared passcode for reviewer authentication (Must match what is in the reviewer screen)
var REVIEWER_PASSCODE = "apple-reviewer-2026";

function doGet(e) {
  var action = e.parameter.action;

  if (action === "getLeaderboard") {
    return handleGetLeaderboard();
  }

  if (action === "getResults") {
    var passcode = e.parameter.passcode;
    if (passcode !== REVIEWER_PASSCODE) {
      return createJsonResponse({ error: "Unauthorized" }, 401);
    }
    return handleGetResults();
  }

  return createJsonResponse({ error: "Invalid action" }, 400);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Acquire lock for up to 30s to prevent concurrent-write sheet corruption
    lock.waitLock(30000);

    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return createJsonResponse({ error: "Malformed JSON payload" }, 400);
    }

    if (data.action === "submit") {
      return handleSubmit(data);
    }

    return createJsonResponse({ error: "Invalid action" }, 400);
  } catch (error) {
    return createJsonResponse({ error: error.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Appends candidate score to Google Sheet.
 */
function handleSubmit(data) {
  var sheet = getOrCreateSheet("Submissions");

  // Format headers if new sheet
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp",
      "Name",
      "Email",
      "TotalPoints",
      "DisplayScore",
      "Band",
      "ViolationsCount",
      "AnswersPayload",
      "ScoresPayload"
    ]);
    sheet.getRange(1, 1, 1, 9).setFontWeight("bold");
  }

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.name,
    data.email,
    data.totalPoints,
    data.displayScore,
    data.band,
    data.violations || 0,
    data.answers || "",
    data.scores || ""
  ]);

  return createJsonResponse({ success: true });
}

/**
 * Returns top results sorted by score for public leaderboard.
 */
function handleGetLeaderboard() {
  var sheet = getOrCreateSheet("Submissions");
  if (sheet.getLastRow() <= 1) {
    return createJsonResponse([]);
  }

  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
  var leaderboard = values.map(function(row) {
    return {
      name: row[1],
      displayScore: Number(row[4]),
      band: row[5]
    };
  });

  // Sort descending by score, limit to top 50
  leaderboard.sort(function(a, b) {
    return b.displayScore - a.displayScore;
  });
  leaderboard = leaderboard.slice(0, 50);

  return createJsonResponse(leaderboard);
}

/**
 * Returns full candidate submissions details for passcode-gated reviewer screen.
 */
function handleGetResults() {
  var sheet = getOrCreateSheet("Submissions");
  if (sheet.getLastRow() <= 1) {
    return createJsonResponse([]);
  }

  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).getValues();
  var results = values.map(function(row) {
    return {
      timestamp: row[0],
      name: row[1],
      email: row[2],
      totalPoints: Number(row[3]),
      displayScore: Number(row[4]),
      band: row[5],
      violations: Number(row[6]),
      answers: row[7],
      scores: row[8]
    };
  });

  // Sort descending by timestamp (newest first)
  results.sort(function(a, b) {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return createJsonResponse(results);
}

/**
 * Helper to fetch or create a named sheet.
 */
function getOrCreateSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

/**
 * Formats JSON HTTP Response.
 */
function createJsonResponse(data, status) {
  var out = ContentService.createTextOutput(JSON.stringify(data));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}
