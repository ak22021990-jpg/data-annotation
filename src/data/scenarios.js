const scenarios = [
  {
    id: 1,
    title: 'Annotate this reported email',
    email: {
      from: 'apple-security@secure-appleid-verify.net',
      replyTo: 'no-reply@appleid-verify.net',
      to: 'user@icloud.com',
      subject: 'Your Apple ID has been locked — verify immediately',
      body: `Dear Customer,

Your Apple ID was suspended due to suspicious sign-in activity. You must verify your identity within 24 hours or your account will be permanently deleted.

[Verify My Apple ID] → http://appleid.secure-appleid-verify.net/unlock

Apple Support`,
    },
    context: null,
    answer: {
      severity: 'high',
      signals: ['urgency', 'spoofed-sender', 'fake-domain'],
      action: 'remove',
      reasoning: 'Classic Apple ID phishing. Sender domain is not apple.com. Urgency + deletion threat are pressure tactics. Deceptive subdomain mimics Apple. SPF/DKIM would fail (inferred — not in context note). High severity — credential harvest with strong social engineering.',
    },
    scoring: {
      severity: { correct: ['high'], partial: ['medium'] },
      signals: { required: ['urgency', 'spoofed-sender', 'fake-domain'], partial: ['auth-fail'] },
      action: { correct: ['remove'] },
    },
  },
  {
    id: 2,
    title: 'Annotate this reported email',
    email: {
      from: 'no-reply@apple.com',
      replyTo: 'no-reply@apple.com',
      to: 'dev@appstudio.io',
      subject: "Your app 'PhotoEdit Pro' has been removed from the App Store",
      body: `Hello,

Your app PhotoEdit Pro (Bundle ID: com.appstudio.photoedit) has been removed from the App Store for violating Guideline 4.3 (Spam).

If you believe this is an error, you may appeal within 14 days via App Store Connect.

Apple Developer Relations`,
    },
    context: 'Reporter note: "I never received this via App Store Connect. I checked and my app is still live. This email arrived out of nowhere."',
    answer: {
      severity: 'high',
      signals: ['spoofed-sender', 'impersonation'],
      action: 'remove',
      reasoning: 'The sender domain is apple.com but the reporter\'s app is confirmed live — this is an impersonation email targeting a developer to create panic and potentially harvest App Store Connect credentials when they "appeal." The legitimate from address makes this harder to detect (possible header spoofing or display name forgery). High severity — targeted developer phishing.',
    },
    scoring: {
      severity: { correct: ['high'], partial: ['medium'] },
      signals: { required: ['impersonation'], partial: ['spoofed-sender'] },
      action: { correct: ['remove'] },
    },
  },
  {
    id: 3,
    title: 'Annotate this reported email',
    email: {
      from: 'deals@appoffers-weekly.com',
      replyTo: 'deals@appoffers-weekly.com',
      to: 'user@icloud.com',
      subject: 'Top 10 free apps this week — curated for iPhone users',
      body: `Hi iPhone fan,

Here are this week's top free App Store picks, curated by our editors.

1. Focusplan Pro — now free
2. SleepCast — limited free tier
3. AirScan HD — free this weekend

[See all 10 picks] → https://appoffers-weekly.com/free-apps

Unsubscribe | appoffers-weekly.com`,
    },
    context: 'The user says they never signed up for this list. The appoffers-weekly.com domain is a legitimate third-party app review site with no malware history. Links go to real App Store listings.',
    answer: {
      severity: 'low',
      signals: ['unsolicited'],
      action: 'filter',
      reasoning: 'This is unsolicited commercial email (spam), not phishing. The sender is a real site, links go to genuine App Store listings, and there is an unsubscribe option. No credential harvesting, no deception. Low severity — standard spam, appropriate action is to filter/route to junk, not remove entirely.',
    },
    scoring: {
      severity: { correct: ['low'], partial: ['medium'] },
      signals: { required: ['unsolicited'], partial: ['unsolicited'] },
      action: { correct: ['filter'], partial: ['remove'] },
    },
  },
  {
    id: 4,
    title: 'Annotate this reported email',
    email: {
      from: 'applesupport-care@gmail.com',
      replyTo: 'applesupport-care@gmail.com',
      to: 'helen.morris72@icloud.com',
      subject: 'URGENT: Your Mac has been hacked — call us now',
      body: `Dear Helen,

Our security systems have detected that your Mac computer has been infected with a dangerous virus. Your personal photos, bank details and passwords are at risk.

You must call our Apple Certified Support line immediately:

+1-888-234-9021

Do not turn off your computer. Our technician will remotely fix the issue for a one-time fee of $299.

Apple Care Security Division`,
    },
    context: 'The reporter is 71 years old. She called the number and was connected to someone who asked for remote access to her Mac before she hung up.',
    answer: {
      severity: 'critical',
      signals: ['urgency', 'impersonation', 'vulnerable-target', 'financial-harm'],
      action: 'remove',
      reasoning: 'Tech support scam targeting an elderly user who nearly gave remote device access. Sender is gmail.com impersonating Apple Care. Urgency, fear tactics, fake virus warning, remote access request, and $299 fee. Vulnerable population targeting elevates this to critical. Escalate for potential law enforcement referral.',
    },
    scoring: {
      severity: { correct: ['critical'], partial: ['high'] },
      signals: { required: ['urgency', 'impersonation', 'vulnerable-target', 'financial-harm'], partial: ['impersonation', 'urgency'] },
      action: { correct: ['remove'] },
    },
  },
  {
    id: 5,
    title: 'Annotate this reported email',
    email: {
      from: 'newsletter@9to5mac.com',
      replyTo: 'newsletter@9to5mac.com',
      to: 'user@icloud.com',
      subject: 'iPhone 16 review roundup + iOS 18 tips',
      body: `Good morning,

This week: our full iPhone 16 Pro review, hidden iOS 18 features you might have missed, and the best Apple Watch bands under $50.

[Read today's issue] → https://9to5mac.com/newsletter/may22

— The 9to5Mac Team

Unsubscribe · Manage preferences`,
    },
    context: 'The user says they do not recall subscribing but the 9to5Mac newsletter is a well-known legitimate Apple news publication. The email passes SPF and DKIM. There is a functioning unsubscribe link.',
    answer: {
      severity: 'low',
      signals: ['unsolicited'],
      action: 'no-action',
      reasoning: 'Legitimate newsletter from a well-known Apple media outlet. Passes authentication, has a real unsubscribe link, no credential requests. The user may have subscribed and forgotten, or email was shared by a partner list. Low severity — not abusive. Appropriate action is no enforcement action; user can unsubscribe.',
    },
    scoring: {
      severity: { correct: ['low', 'not-abusive'], partial: ['medium'] },
      signals: { required: ['unsolicited'], partial: ['unsolicited'] },
      action: { correct: ['no-action', 'filter'], partial: ['filter'] },
    },
  },
  {
    id: 6,
    title: 'Annotate this reported email',
    email: {
      from: 'billing@apple.com',
      replyTo: 'billing@apple.com',
      to: 'user@icloud.com',
      subject: 'Your receipt for GarageBand — $4.99',
      body: `Hi,

Thank you for your purchase.

GarageBand — $4.99
Date: May 22, 2024
Order ID: MX7R-28FQ

If you didn't make this purchase, visit reportaproblem.apple.com

Apple`,
    },
    context: 'The reporter says they did not purchase GarageBand and are worried their account has been compromised. The sender domain is apple.com. SPF and DKIM both pass. The link goes to apple.com/reportaproblem — a real Apple page.',
    answer: {
      severity: 'low',
      signals: [],
      action: 'no-action',
      reasoning: 'This is a legitimate Apple receipt email — verified sender domain, passing authentication, real Apple link. The reporter may have a genuine unauthorised purchase, but that is an account security issue, not an abuse issue with the email itself. The email is not abusive. Route reporter to Apple\'s account support channel.',
    },
    scoring: {
      severity: { correct: ['low', 'not-abusive'], partial: ['medium'] },
      signals: { required: [], partial: [] },
      action: { correct: ['no-action'], partial: ['escalate'] },
    },
  },
  {
    id: 7,
    title: 'Annotate this reported email',
    email: {
      from: 'no-reply@appleid.apple.com',
      replyTo: 'support@apple-id-helpdesk.io',
      to: 'user@icloud.com',
      subject: 'Sign-in attempt from new device',
      body: `Your Apple ID was used to sign in to iCloud on a Windows PC in Moscow, Russia.

If this was you, you can ignore this email.

If this was not you — your Apple ID password has been compromised. Reset it now:

[Reset My Password] → http://apple-id-helpdesk.io/reset`,
    },
    context: null,
    answer: {
      severity: 'high',
      signals: ['spoofed-sender', 'fake-domain', 'urgency', 'impersonation'],
      action: 'remove',
      reasoning: 'Sophisticated phishing. From address mimics apple.com but Reply-To reveals the real origin: apple-id-helpdesk.io. The reset link goes to the same fake domain. Geolocation fear tactic (Moscow) is a classic social engineering trigger. High severity — deceptive enough to fool careful users.',
    },
    scoring: {
      severity: { correct: ['high'], partial: ['medium'] },
      signals: { required: ['spoofed-sender', 'fake-domain'], partial: ['urgency', 'impersonation'] },
      action: { correct: ['remove'] },
    },
  },
  {
    id: 8,
    title: 'Annotate this reported email',
    email: {
      from: 'promo@apple.com',
      replyTo: 'promo@apple.com',
      to: 'user@icloud.com',
      subject: 'Get 3 months of Apple TV+ free with your new iPhone',
      body: `Hi,

As an Apple customer, you're eligible for 3 months of Apple TV+ free when you activate a new iPhone 15 or later.

Offer expires June 30. Terms apply.

[Claim your offer] → https://tv.apple.com/offer/iphone

Apple`,
    },
    context: 'The reporter says this looks like spam and they didn\'t ask for it. SPF and DKIM pass. The link goes to a real Apple TV subdomain. Apple runs legitimate promotional emails to registered customers.',
    answer: {
      severity: 'low',
      signals: ['unsolicited'],
      action: 'no-action',
      reasoning: 'Legitimate Apple promotional email. Verified sender, passing authentication, real destination URL. The user may have consented to marketing emails when setting up their Apple ID — this is a genuine Apple offer, not abusive content. Low/not abusive. No enforcement action needed.',
    },
    scoring: {
      severity: { correct: ['low', 'not-abusive'], partial: ['medium'] },
      signals: { required: ['unsolicited'], partial: ['unsolicited'] },
      action: { correct: ['no-action', 'filter'], partial: ['filter'] },
    },
  },
  {
    id: 9,
    title: 'Annotate this reported email',
    email: {
      from: 'itunes-noreply@apple.com',
      replyTo: 'itunes-noreply@apple.com',
      to: 'user@icloud.com',
      subject: 'Your subscription renews tomorrow — $99.99',
      body: `Dear User,

Your Apple One Premier subscription will automatically renew tomorrow for $99.99/year.

If you wish to cancel, you must act before midnight tonight:

[Cancel Subscription] → http://apple-subscriptions-manage.com/cancel

Apple Billing Team`,
    },
    context: 'The reporter has Apple One but the standard price is $37.95/month. SPF fails. DKIM fails. The link does not go to apple.com.',
    answer: {
      severity: 'high',
      signals: ['spoofed-sender', 'fake-domain', 'urgency', 'impersonation', 'auth-fail'],
      action: 'remove',
      reasoning: 'Phishing using a fake renewal amount to create urgency. Sender fails both SPF and DKIM despite claiming to be apple.com. The cancel link goes to a non-Apple domain. The inflated price ($99.99 vs $37.95) is designed to panic the user into clicking. High severity — financial fear tactic with authentication failures.',
    },
    scoring: {
      severity: { correct: ['high'], partial: ['medium'] },
      signals: { required: ['spoofed-sender', 'fake-domain', 'urgency', 'auth-fail'], partial: ['impersonation'] },
      action: { correct: ['remove'] },
    },
  },
  {
    id: 10,
    title: 'Annotate this reported email',
    email: {
      from: 'family-sharing@apple.com',
      replyTo: 'family-sharing@apple.com',
      to: 'parent@icloud.com',
      subject: 'Screen Time request from Liam',
      body: `Hi,

Liam is asking for more Screen Time. Liam wants an additional 2 hours of access today.

[Approve] [Decline]

If you did not set up Family Sharing with this child, contact Apple Support.

Apple`,
    },
    context: 'The reporter says they have no child named Liam and have never set up Family Sharing. SPF and DKIM both pass. The approve/decline buttons link to apple.com/family.',
    answer: {
      severity: 'low',
      signals: [],
      action: 'no-action',
      reasoning: 'Authenticated email from apple.com with real Apple links. The most likely explanation is the reporter is receiving emails intended for another account (e.g. address typo when setting up Family Sharing) or this is a test/QA scenario. The email itself is not abusive. Route reporter to Apple account support to investigate the Family Sharing configuration.',
    },
    scoring: {
      severity: { correct: ['low', 'not-abusive'], partial: ['medium'] },
      signals: { required: [], partial: [] },
      action: { correct: ['no-action', 'escalate'], partial: ['escalate'] },
    },
  },
]

export default scenarios
