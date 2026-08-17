  /**
   * Email Abuse Annotation Test — Google Apps Script
   *
   * Handles:
   *   POST action:"register"    — saves name + email when assessment starts
   *   POST action:"submit"      — updates row with scores + writes per-scenario raw data
   *   POST action:"submitFinal" — writes final scores
   *   GET  ?checkEmail=...      — checks if an email has already been used
   *   GET  ?action=getResults&passcode=... — reviewer screen data (passcode-gated)
   *   GET  ?action=getLeaderboard         — public top-50 leaderboard
   *
   * Setup:
   *   1. Create a Google Sheet — tabs are auto-created on first write.
   *   2. Copy the Sheet ID from its URL and paste into SPREADSHEET_ID below.
   *   3. Apps Script > paste this file > Save.
   *   4. Script Properties: set REVIEWER_PASSCODE (used for getResults gate).
   *   5. Deploy > Manage deployments > New version > Deploy.
   *   6. Copy the /exec URL into annotation project's .env as VITE_GAS_URL.
   *
   */

  var SPREADSHEET_ID = '1J1Y2WFySEnFsTTq75JqyMGE9eJZBcaXl0-Pty7ZFm9Y';

  function getSpreadsheet() {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  // ── Sheet auto-creation with headers ────────────────────────────────────────

  function ensureSheets(ss) {
    var summary = ss.getSheetByName('Summary');
    if (!summary) {
      summary = ss.insertSheet('Summary');
      summary.appendRow([
        'Timestamp', 'Name', 'Email', 'Status',
        'Total Points', 'Display Score', 'Band',
        'Severity Acc', 'Signal Acc', 'Action Acc',
        'Proctoring Violations', 'Final Score', 'Integrity Log'
      ]);
      summary.getRange(1, 1, 1, 13).setFontWeight('bold');
      summary.setFrozenRows(1);
    }

    var raw = ss.getSheetByName('RawData');
    if (!raw) {
      raw = ss.insertSheet('RawData');
      raw.appendRow([
        'Timestamp', 'Name', 'Email',
        'Scenario ID', 'Scenario Title',
        'Selected Severity', 'Correct Severity', 'Severity Points',
        'Selected Signals', 'Required Signals', 'Signal Points',
        'Selected Action', 'Correct Action', 'Action Points',
        'Total Points'
      ]);
      raw.getRange(1, 1, 1, 15).setFontWeight('bold');
      raw.setFrozenRows(1);
    }

    return { summary: summary, raw: raw };
  }

  function findRowByEmail(sheet, email) {
    if (sheet.getLastRow() < 2) return -1;
    var emails = sheet.getRange(2, 3, sheet.getLastRow() - 1, 1).getValues();
    var needle = email.trim().toLowerCase();
    for (var i = 0; i < emails.length; i++) {
      if (String(emails[i][0]).trim().toLowerCase() === needle) {
        return i + 2;
      }
    }
    return -1;
  }

  // ── POST ────────────────────────────────────────────────────────────────────

  function doPost(e) {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(30000);

      var payload;
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        return jsonResponse({ ok: false, error: 'Malformed JSON payload' });
      }

      var action = payload.action || '';
      var ss = getSpreadsheet();
      var ts = new Date().toISOString();

      // ── Register ──
      if (action === 'register') {
        var sheets = ensureSheets(ss);
        sheets.summary.appendRow([
          ts, payload.name || '', payload.email || '',
          'In Progress', '', '', '', '', '', '', '', ''
        ]);
        return jsonResponse({ ok: true });
      }

      // ── Submit (basic — scores only) ──
      if (action === 'submit') {
        var sheets = ensureSheets(ss);
        var row = findRowByEmail(sheets.summary, payload.email || '');
        var summaryVals = [
          'Completed',
          payload.totalPoints || 0,
          payload.displayScore || 0,
          payload.band || '',
          payload.severityAcc || 0,
          payload.signalAcc || 0,
          payload.actionAcc || 0,
          payload.violations || 0,
          payload.finalScore || payload.displayScore || 0,
          JSON.stringify(payload.integrityLog || [])
        ];

        if (row > 0) {
          sheets.summary.getRange(row, 4, 1, 10).setValues([summaryVals]);
        } else {
          sheets.summary.appendRow([
            ts, payload.name || '', payload.email || ''
          ].concat(summaryVals));
        }

        var perScenario = payload.perScenario || [];
        for (var i = 0; i < perScenario.length; i++) {
          var r = perScenario[i];
          sheets.raw.appendRow([
            ts, payload.name || '', payload.email || '',
            sanitiseCell(r.scenarioId || ''),
            sanitiseCell(r.scenarioTitle || ''),
            sanitiseCell(r.selectedSeverity || ''),
            sanitiseCell(r.correctSeverity || ''),
            r.severityPoints || 0,
            sanitiseCell(r.selectedSignals || ''),
            sanitiseCell(r.requiredSignals || ''),
            r.signalPoints || 0,
            sanitiseCell(r.selectedAction || ''),
            sanitiseCell(r.correctAction || ''),
            r.actionPoints || 0,
            r.totalPoints || 0
          ]);
        }

        return jsonResponse({ ok: true });
      }

      // ── Submit Final ──
      if (action === 'submitFinal') {
        var sheets = ensureSheets(ss);
        var row = findRowByEmail(sheets.summary, payload.email || '');
        var summaryVals = [
          'Completed',
          payload.totalPoints || 0,
          payload.displayScore || 0,
          payload.band || '',
          payload.severityAcc || 0,
          payload.signalAcc || 0,
          payload.actionAcc || 0,
          payload.violations || 0,
          payload.finalScore || payload.displayScore || 0,
          JSON.stringify(payload.integrityLog || [])
        ];

        if (row > 0) {
          sheets.summary.getRange(row, 4, 1, 10).setValues([summaryVals]);
        } else {
          sheets.summary.appendRow([
            ts, payload.name || '', payload.email || ''
          ].concat(summaryVals));
        }

        var perScenario = payload.perScenario || [];
        for (var i = 0; i < perScenario.length; i++) {
          var r = perScenario[i];
          sheets.raw.appendRow([
            ts, payload.name || '', payload.email || '',
            sanitiseCell(r.scenarioId || ''),
            sanitiseCell(r.scenarioTitle || ''),
            sanitiseCell(r.selectedSeverity || ''),
            sanitiseCell(r.correctSeverity || ''),
            r.severityPoints || 0,
            sanitiseCell(r.selectedSignals || ''),
            sanitiseCell(r.requiredSignals || ''),
            r.signalPoints || 0,
            sanitiseCell(r.selectedAction || ''),
            sanitiseCell(r.correctAction || ''),
            r.actionPoints || 0,
            r.totalPoints || 0
          ]);
        }

        return jsonResponse({ ok: true });
      }

      return jsonResponse({ ok: false, error: 'Unknown action' });

    } catch (err) {
      return jsonResponse({ ok: false, error: err.message });
    } finally {
      lock.releaseLock();
    }
  }

  // ── GET ─────────────────────────────────────────────────────────────────────

  function doGet(e) {
    var params = e.parameter || {};

    // Check if email already used
    if (params.checkEmail) {
      var ss = getSpreadsheet();
      var sheets = ensureSheets(ss);
      var exists = findRowByEmail(sheets.summary, params.checkEmail) > 0;
      return jsonResponse({ exists: exists });
    }

    // Reviewer results (passcode-gated)
    if (params.action === 'getResults') {
      var passcode = params.passcode || '';
      // Authorised reviewers: Rajani (my.rajani@sutherlandglobal.com)
      // Passcode stored in Script Properties as REVIEWER_PASSCODE.
      var correct = PropertiesService.getScriptProperties().getProperty('REVIEWER_PASSCODE');
      if (!correct || passcode !== correct) {
        return jsonResponse({ ok: false, error: 'Invalid passcode' });
      }

      var ss = getSpreadsheet();
      var sheets = ensureSheets(ss);
      if (sheets.summary.getLastRow() < 2) {
        return jsonResponse({ ok: true, submissions: [] });
      }

      var data = sheets.summary.getRange(2, 1, sheets.summary.getLastRow() - 1, 13).getValues();
      var submissions = [];
      for (var i = 0; i < data.length; i++) {
        var row = data[i];
        submissions.push({
          timestamp: row[0],
          name: row[1],
          email: row[2],
          status: row[3],
          totalPoints: Number(row[4]),
          displayScore: Number(row[5]),
          band: row[6],
          severityAcc: Number(row[7]),
          signalAcc: Number(row[8]),
          actionAcc: Number(row[9]),
          violations: Number(row[10]),
          finalScore: Number(row[11]),
          integrityLog: JSON.parse(row[12] || '[]')
        });
      }

      // Attach per-scenario raw data grouped by email
      if (sheets.raw.getLastRow() >= 2) {
        var rawData = sheets.raw.getRange(2, 1, sheets.raw.getLastRow() - 1, 15).getValues();
        var rawByEmail = {};
        for (var j = 0; j < rawData.length; j++) {
          var r = rawData[j];
          var email = String(r[2]).trim().toLowerCase();
          if (!rawByEmail[email]) rawByEmail[email] = [];
          rawByEmail[email].push({
            scenarioId: r[3],
            scenarioTitle: r[4],
            selectedSeverity: r[5],
            correctSeverity: r[6],
            severityPoints: Number(r[7]),
            selectedSignals: r[8],
            requiredSignals: r[9],
            signalPoints: Number(r[10]),
            selectedAction: r[11],
            correctAction: r[12],
            actionPoints: Number(r[13]),
            totalPoints: Number(r[14])
          });
        }
        for (var k = 0; k < submissions.length; k++) {
          var key = String(submissions[k].email).trim().toLowerCase();
          submissions[k].perScenario = rawByEmail[key] || [];
        }
      }

      submissions.sort(function(a, b) {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      return jsonResponse({ ok: true, submissions: submissions });
    }

    // Public leaderboard
    if (params.action === 'getLeaderboard') {
      var ss = getSpreadsheet();
      var sheets = ensureSheets(ss);
      if (sheets.summary.getLastRow() < 2) {
        return jsonResponse([]);
      }

      var data = sheets.summary.getRange(2, 1, sheets.summary.getLastRow() - 1, 7).getValues();
      var leaderboard = [];
      for (var i = 0; i < data.length; i++) {
        if (data[i][3] === 'Completed') {
          leaderboard.push({
            name: data[i][1],
            displayScore: Number(data[i][5]),
            band: data[i][6]
          });
        }
      }

      leaderboard.sort(function(a, b) {
        return b.displayScore - a.displayScore;
      });
      leaderboard = leaderboard.slice(0, 50);

      return jsonResponse(leaderboard);
    }

    return jsonResponse({ error: 'No action specified' });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function jsonResponse(data) {
    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }

  function sanitiseCell(val) {
    if (typeof val === 'string' && /^[=+\-@]/.test(val)) {
      return "'" + val;
    }
    return val;
  }

