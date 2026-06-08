const scenarios = [
  {
    id: 1,
    title: 'Annotate this reported email',
    email: {
      from: 'orange-security@secure-orangeid-verify.net',
      replyTo: 'no-reply@orangeid-verify.net',
      to: 'user@orangecloud.com',
      subject: 'Your Orange ID has been locked — verify immediately',
      body: `Dear Customer,

Your Orange ID was suspended due to suspicious sign-in activity. You must verify your identity within 24 hours or your account will be permanently deleted.

[Verify My Orange ID] → http://orangeid.secure-orangeid-verify.net/unlock

Orange Support`,
    },
    context: null,
    answer: {
      severity: 'high',
      signals: ['urgency', 'spoofed-sender', 'fake-domain'],
      action: 'remove',
      reasoning: 'Classic Orange ID phishing. Sender domain is not orange.com. Urgency + deletion threat are pressure tactics. Deceptive subdomain mimics Orange. SPF/DKIM would fail (inferred — not in context note). High severity — credential harvest with strong social engineering.',
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
      from: 'no-reply@orange.com',
      replyTo: 'no-reply@orange.com',
      to: 'dev@appstudio.io',
      subject: "Your app 'PhotoEdit Pro' has been removed from the Play Store",
      body: `Hello,

Your app PhotoEdit Pro (Bundle ID: com.appstudio.photoedit) has been removed from the Play Store for violating Guideline 4.3 (Spam).

If you believe this is an error, you may appeal within 14 days via the Developer Portal.

Orange Developer Relations`,
    },
    context: 'Reporter note: "I never received this via the Developer Portal. I checked and my app is still live. This email arrived out of nowhere."',
    answer: {
      severity: 'high',
      signals: ['spoofed-sender', 'impersonation'],
      action: 'remove',
      reasoning: 'The sender domain is orange.com but the reporter\'s app is confirmed live — this is an impersonation email targeting a developer to create panic and potentially harvest Developer Portal credentials when they "appeal." The legitimate from address makes this harder to detect (possible header spoofing or display name forgery). High severity — targeted developer phishing.',
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
      to: 'user@orangecloud.com',
      subject: 'Top 10 free apps this week — curated for Android phone users',
      body: `Hi Android fan,

Here are this week's top free Play Store picks, curated by our editors.

1. Focusplan Pro — now free
2. SleepCast — limited free tier
3. AirScan HD — free this weekend

[See all 10 picks] → https://appoffers-weekly.com/free-apps

Unsubscribe | appoffers-weekly.com`,
    },
    context: 'The user says they never signed up for this list. The appoffers-weekly.com domain is a legitimate third-party app review site with no malware history. Links go to real Play Store listings.',
    answer: {
      severity: 'low',
      signals: ['unsolicited'],
      action: 'filter',
      reasoning: 'This is unsolicited commercial email (spam), not phishing. The sender is a real site, links go to genuine Play Store listings, and there is an unsubscribe option. No credential harvesting, no deception. Low severity — standard spam, appropriate action is to filter/route to junk, not remove entirely.',
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
      from: 'orangesupport-care@gmail.com',
      replyTo: 'orangesupport-care@gmail.com',
      to: 'helen.morris54@orangecloud.com',
      subject: 'URGENT: Your Windows PC has been hacked — call us now',
      body: `Dear Helen,

Our security systems have detected that your Windows PC has been infected with a dangerous virus. Your personal photos, bank details and passwords are at risk.

You must call our Orange Certified Support line immediately:

+1-888-234-9021

Do not turn off your computer. Our technician will remotely fix the issue for a one-time fee of $299.

Orange Care Security Division`,
    },
    context: 'The reporter is 71 years old. She called the number and was connected to someone who asked for remote access to her Windows PC before she hung up.',
    answer: {
      severity: 'critical',
      signals: ['urgency', 'impersonation', 'vulnerable-target', 'financial-harm'],
      action: 'remove',
      reasoning: 'Tech support scam targeting an elderly user who nearly gave remote device access. Sender is gmail.com impersonating Orange Care. Urgency, fear tactics, fake virus warning, remote access request, and $299 fee. Vulnerable population targeting elevates this to critical. Escalate for potential law enforcement referral.',
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
      from: 'newsletter@9to5android.com',
      replyTo: 'newsletter@9to5android.com',
      to: 'user@orangecloud.com',
      subject: 'Android phone 16 review roundup + Windows tips',
      body: `Good morning,

This week: our full Android phone 16 Pro review, hidden Windows features you might have missed, and the best smartwatch bands under $50.

[Read today's issue] → https://9to5android.com/newsletter/may22

— The 9to5Android Team

Unsubscribe · Manage preferences`,
    },
    context: 'The user says they do not recall subscribing but the 9to5Android newsletter is a well-known legitimate tech news publication. The email passes SPF and DKIM. There is a functioning unsubscribe link.',
    answer: {
      severity: 'low',
      signals: ['unsolicited'],
      action: 'no-action',
      reasoning: 'Legitimate newsletter from a well-known tech media outlet. Passes authentication, has a real unsubscribe link, no credential requests. The user may have subscribed and forgotten, or email was shared by a partner list. Low severity — not abusive. Appropriate action is no enforcement action; user can unsubscribe.',
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
      from: 'billing@orange.com',
      replyTo: 'billing@orange.com',
      to: 'user@orangecloud.com',
      subject: 'Your receipt for BeatMaker Pro — $4.99',
      body: `Hi,

Thank you for your purchase.

BeatMaker Pro — $4.99
Date: May 22, 2024
Order ID: MX7R-28FQ

If you didn't make this purchase, visit reportaproblem.orange.com

Orange`,
    },
    context: 'The reporter says they did not purchase BeatMaker Pro and are worried their account has been compromised. The sender domain is orange.com. SPF and DKIM both pass. The link goes to orange.com/reportaproblem — a real Orange page.',
    answer: {
      severity: 'low',
      signals: [],
      action: 'no-action',
      reasoning: 'This is a legitimate Orange receipt email — verified sender domain, passing authentication, real Orange link. The reporter may have a genuine unauthorised purchase, but that is an account security issue, not an abuse issue with the email itself. The email is not abusive. Route reporter to Orange\'s account support channel.',
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
      from: 'no-reply@orangeid.orange.com',
      replyTo: 'support@orange-id-helpdesk.io',
      to: 'user@orangecloud.com',
      subject: 'Sign-in attempt from new device',
      body: `Your Orange ID was used to sign in to OrangeCloud on a Windows PC in Moscow, Russia.

If this was you, you can ignore this email.

If this was not you — your Orange ID password has been compromised. Reset it now:

[Reset My Password] → http://orange-id-helpdesk.io/reset`,
    },
    context: null,
    answer: {
      severity: 'high',
      signals: ['spoofed-sender', 'fake-domain', 'urgency', 'impersonation'],
      action: 'remove',
      reasoning: 'Sophisticated phishing. From address mimics orange.com but Reply-To reveals the real origin: orange-id-helpdesk.io. The reset link goes to the same fake domain. Geolocation fear tactic (Moscow) is a classic social engineering trigger. High severity — deceptive enough to fool careful users.',
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
      from: 'promo@orange.com',
      replyTo: 'promo@orange.com',
      to: 'user@orangecloud.com',
      subject: 'Get 3 months of Orange TV+ free with your new Android phone',
      body: `Hi,

As an Orange customer, you're eligible for 3 months of Orange TV+ free when you activate a new Android phone 15 or later.

Offer expires June 30. Terms apply.

[Claim your offer] → https://tv.orange.com/offer/android

Orange`,
    },
    context: 'The reporter says this looks like spam and they didn\'t ask for it. SPF and DKIM pass. The link goes to a real Orange TV subdomain. Orange runs legitimate promotional emails to registered customers.',
    answer: {
      severity: 'low',
      signals: ['unsolicited'],
      action: 'no-action',
      reasoning: 'Legitimate Orange promotional email. Verified sender, passing authentication, real destination URL. The user may have consented to marketing emails when setting up their Orange ID — this is a genuine Orange offer, not abusive content. Low/not abusive. No enforcement action needed.',
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
      from: 'orange-noreply@orange.com',
      replyTo: 'orange-noreply@orange.com',
      to: 'user@orangecloud.com',
      subject: 'Your subscription renews tomorrow — $99.99',
      body: `Dear User,

Your Orange One Premier subscription will automatically renew tomorrow for $99.99/year.

If you wish to cancel, you must act before midnight tonight:

[Cancel Subscription] → http://orange-subscriptions-manage.com/cancel

Orange Billing Team`,
    },
    context: 'The reporter has Orange One but the standard price is $37.95/month. SPF fails. DKIM fails. The link does not go to orange.com.',
    answer: {
      severity: 'high',
      signals: ['spoofed-sender', 'fake-domain', 'urgency', 'impersonation', 'auth-fail'],
      action: 'remove',
      reasoning: 'Phishing using a fake renewal amount to create urgency. Sender fails both SPF and DKIM despite claiming to be orange.com. The cancel link goes to a non-Orange domain. The inflated price ($99.99 vs $37.95) is designed to panic the user into clicking. High severity — financial fear tactic with authentication failures.',
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
      from: 'family-sharing@orange.com',
      replyTo: 'family-sharing@orange.com',
      to: 'parent@orangecloud.com',
      subject: 'Digital Wellbeing request from Liam',
      body: `Hi,

Liam is asking for more Digital Wellbeing time. Liam wants an additional 2 hours of access today.

[Approve] [Decline]

If you did not set up Family Group with this child, contact Orange Support.

Orange`,
    },
    context: 'The reporter says they have no child named Liam and have never set up Family Group. SPF and DKIM both pass. The approve/decline buttons link to orange.com/family.',
    answer: {
      severity: 'low',
      signals: [],
      action: 'no-action',
      reasoning: 'Authenticated email from orange.com with real Orange links. The most likely explanation is the reporter is receiving emails intended for another account (e.g. address typo when setting up Family Group) or this is a test/QA scenario. The email itself is not abusive. Route reporter to Orange account support to investigate the Family Group configuration.',
    },
    scoring: {
      severity: { correct: ['low', 'not-abusive'], partial: ['medium'] },
      signals: { required: [], partial: [] },
      action: { correct: ['no-action', 'escalate'], partial: ['escalate'] },
    },
  },
]

export default scenarios
