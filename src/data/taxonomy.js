export const SEVERITY_OPTS = [
  { id: 'not-abusive', label: 'Not abusive', cls: '' },
  { id: 'low', label: 'Low', cls: 'sev-low' },
  { id: 'medium', label: 'Medium', cls: 'sev-med' },
  { id: 'high', label: 'High', cls: 'sev-high' },
  { id: 'critical', label: 'Critical', cls: 'sev-crit' },
]

export const SIGNAL_OPTS = [
  { id: 'spoofed-sender', label: 'Spoofed sender' },
  { id: 'fake-domain', label: 'Fake/lookalike domain' },
  { id: 'urgency', label: 'Urgency / threat language' },
  { id: 'impersonation', label: 'Brand impersonation' },
  { id: 'unsolicited', label: 'Unsolicited (spam)' },
  { id: 'vulnerable-target', label: 'Vulnerable population targeted' },
  { id: 'financial-harm', label: 'Financial harm / fee requested' },
  { id: 'malware-link', label: 'Malware / suspicious link' },
  { id: 'auth-fail', label: 'SPF / DKIM failure' },
  { id: 'none-detected', label: 'No abuse signals detected' },
]

export const ACTION_OPTS = [
  { id: 'no-action', label: 'No action' },
  { id: 'filter', label: 'Filter to junk' },
  { id: 'remove', label: 'Remove / block sender' },
  { id: 'escalate', label: 'Escalate for review' },
]

export const SIGNAL_IDS = SIGNAL_OPTS.map(s => s.id)
export const SEVERITY_IDS = SEVERITY_OPTS.map(s => s.id)
export const ACTION_IDS = ACTION_OPTS.map(s => s.id)
