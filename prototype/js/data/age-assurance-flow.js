/* Age-assurance dataset.
   Wrapped as a script so the prototype also runs when opened directly from disk
   (file:// blocks fetch).

   Structure:
   - methods[]  : the three signals, each with its own chain, steps and records
   - each step has two halves:
       see     — what the visitor actually sees at that moment
       action  — what runs behind the interface, with whose record
   - evidence[] : claim -> source -> what the source establishes
*/

window.AGE_FLOW = {
  meta: {
    title: "The Yes/No Contract",
    subtitle: "What an age gate actually exchanges, and who carries the error",
    threshold: 18,
    stack: "Stack 2 — Infrastructure, Tools and Code: the request, the evaluator, the record and the token returned."
  },

  /* Three services I actually met, and what each asked for and returned. */
  cases: [
    {
      service: "Instagram",
      met: "Changing my date of birth: a video selfie, or an uploaded ID.",
      back: "Pass or fail. The selfie image is deleted after the estimate; an uploaded ID is kept up to 30 days."
    },
    {
      service: "WeChat",
      met: "A flagged account: my face in a frame, then a check against my identity record.",
      back: "Pass or fail. The result and a hash are kept; the face image is not."
    },
    {
      service: "Steam (UK)",
      met: "Adding a card: card number, billing address, a £1 test authorisation, then my bank's code.",
      back: "“Age verified for as long as a valid credit card is stored.”"
    }
  ],

  /* ---------------------------------------------------------------- methods */
  methods: [
    {
      id: "face",
      name: "Facial age estimation",
      chip: "Selfie",
      gate_ask: "Take a selfie",
      gate_fields: ["Selfie", "Consent"],
      gate_fields_b: ["Proof", "Consent"],
      gate_copy_a: "We only receive a yes or no answer. Method: facial age estimation.",
      gate_copy_b: "We only receive a proof that you are over 18. Method: reusable credential.",
      visible: ["a camera window", "an estimate in progress", "pass or fail"],
      hidden: [
        "the frames that were sent, and to which domain",
        "the estimate and the decision the provider keeps",
        "what the service writes after the answer arrives",
        "whether a wrongly refused adult has any route back"
      ],
      exclusion: "no camera, poor light, or a face the model reads as younger",
      reference: {
        label: "Yoti Age Estimation",
        detail: "Instagram sends only the selfie image to Yoti; the business receives a threshold result; both delete the image.",
        url: "https://support.yoti.com/article-detail?articleId=ka0Py00000087WHIAY"
      },
      reference_b: {
        label: "Yoti reusable digital ID / age token",
        detail: "Created once, then shared as a verified age by QR code; the token holds no personal details.",
        url: "https://support.yoti.com/article-detail?articleId=ka0Py00000087WHIAY"
      },
      chain: {
        default: ["Visitor", "Service", "Estimator", "Estimator store", "Service"],
        reworked: ["Visitor", "Issuer", "Visitor", "Service"]
      },
      flow: {
        default: [
          {
            n: 1, from: "Visitor", to: "Service",
            see: "A button: “Take a selfie”.",
            action: "The gate offers facial age estimation and nothing else about the check.",
            fields: ["IP address", "user agent", "requested URL", "account session"],
            record: "Service: an ordinary request log",
            evidence: "s8",
            uncertain: "Whether an account is required before the gate varies by service."
          },
          {
            n: 2, from: "Visitor", to: "Estimator",
            see: "A camera window. “Hold still — estimating.”",
            action: "Frames are posted to the estimator’s domain with a site identifier.",
            fields: ["image frames", "site identifier", "timestamp", "email or phone (sometimes)"],
            record: "Estimator: the capture, while it is processed",
            evidence: "s3",
            uncertain: "What travels with the frames is set by the provider, not by the page the visitor is on."
          },
          {
            n: 3, from: "Estimator", to: "Service",
            see: "“Verified”, or “We can’t confirm you’re over 18”.",
            action: "The estimator returns a threshold result and a signed token.",
            fields: ["over / under 18", "age band (optional)", "signed token"],
            record: "Estimator: the estimate and the decision; images deleted, per provider policy",
            evidence: "s3",
            uncertain: "Deletion is asserted by the provider, not independently observable."
          },
          {
            n: 4, from: "Service", to: "Visitor",
            see: "The page, or a refusal screen.",
            action: "The service stores the result and grants or denies access.",
            fields: ["the page, or a refusal screen"],
            record: "Service: the result, often tied to the account",
            evidence: "s13",
            uncertain: "No appeal is offered here; the statutory routes are somewhere else."
          }
        ],
        reworked: [
          {
            n: 1, from: "Visitor", to: "Issuer",
            see: "Set up once, with a provider you choose: a selfie and an email.",
            action: "One capture, once, to obtain a reusable credential.",
            fields: ["selfie frames", "email", "consent to issue"],
            record: "Issuer: the capture and the issuance record",
            evidence: "s3",
            uncertain: "The choice of issuer is real only if more than one is accepted."
          },
          {
            n: 2, from: "Issuer", to: "Visitor",
            see: "A proof appears in your wallet: over 18, scope, expiry.",
            action: "The issuer signs a boolean claim.",
            fields: ["proof", "scope", "expiry"],
            record: "Wallet / device: the proof",
            evidence: "s11",
            uncertain: "The proof carries no image, but it can still be joined to the account that holds it."
          },
          {
            n: 3, from: "Visitor", to: "Service",
            see: "“Prove with your wallet” — a signature check.",
            action: "The proof is presented; the service verifies the issuer.",
            fields: ["proof", "signature", "timestamp"],
            record: "Service: valid / invalid",
            evidence: "s12",
            uncertain: "Batch issuance limits linking across sites; an account still links visits."
          },
          {
            n: 4, from: "Service", to: "Visitor",
            see: "The page, or the same refusal screen.",
            action: "The service grants or denies access.",
            fields: ["the page, or a refusal screen"],
            record: "Service: valid / invalid, tied to the account",
            evidence: "s13",
            uncertain: "A refused adult looks exactly like a correct refusal."
          }
        ]
      }
    },

    {
      id: "id",
      name: "Photo ID document",
      chip: "Photo ID",
      gate_ask: "Upload a photo ID",
      gate_fields: ["Document", "Selfie"],
      gate_fields_b: ["Wallet", "Proof"],
      gate_copy_a: "We only receive a yes or no answer. Method: photo ID matching.",
      gate_copy_b: "We only receive a proof that you are over 18. Method: reusable credential from an ID check.",
      visible: ["an upload button", "a document and a selfie requested", "pass or fail"],
      hidden: [
        "that the document image goes to a separate checking company",
        "how long that company keeps the document",
        "whether a date of birth comes back with the answer",
        "who is excluded for not owning a passport or licence"
      ],
      exclusion: "no passport, licence or other accepted document",
      reference: {
        label: "Yoti ID document check",
        detail: "Document scan plus a selfie, matched and checked for authenticity; the business receives over/under or a year of age.",
        url: "https://support.yoti.com/article-detail?articleId=ka0Py00000087WHIAY"
      },
      reference_b: {
        label: "Yoti reusable digital ID / age token",
        detail: "The digital ID is built from a verified document once; after that only a threshold is shared.",
        url: "https://support.yoti.com/article-detail?articleId=ka0Py00000087WHIAY"
      },
      chain: {
        default: ["Visitor", "Service", "ID checker", "Checker store", "Service"],
        reworked: ["Visitor", "Issuer", "Visitor", "Service"]
      },
      flow: {
        default: [
          {
            n: 1, from: "Visitor", to: "Service",
            see: "A button: “Upload a photo ID”.",
            action: "The gate offers document checking as one option among others.",
            fields: ["IP address", "user agent", "requested URL", "account session"],
            record: "Service: an ordinary request log",
            evidence: "s8",
            uncertain: "Which documents are accepted is a configuration choice."
          },
          {
            n: 2, from: "Visitor", to: "ID checker",
            see: "“Photograph your document, then your face.”",
            action: "The document image and a selfie are posted to the checker.",
            fields: ["document image", "selfie", "document number", "name and date of birth"],
            record: "ID checker: the document, for a stated retention period",
            evidence: "s2",
            uncertain: "The retention window varies by provider and jurisdiction."
          },
          {
            n: 3, from: "ID checker", to: "Service",
            see: "“Verified”.",
            action: "Authenticity, match and date of birth are checked; the result is returned.",
            fields: ["pass / fail", "date of birth (sometimes)"],
            record: "ID checker: verification result, plus the document for the retention window",
            evidence: "s3",
            uncertain: "Whether the service also receives a date of birth is a configuration choice."
          },
          {
            n: 4, from: "Service", to: "Visitor",
            see: "The page, or a refusal screen.",
            action: "The service stores the result and grants or denies access.",
            fields: ["the page, or a refusal screen"],
            record: "Service: the result, plus a date of birth if one was returned",
            evidence: "s13",
            uncertain: "A document that fails to match is refused like a person who is under 18."
          }
        ],
        reworked: [
          {
            n: 1, from: "Visitor", to: "Issuer",
            see: "Scan your document once, in the issuer’s app.",
            action: "One document check, once, to obtain a credential.",
            fields: ["document image", "selfie", "consent to issue"],
            record: "Issuer: the document and the verification result",
            evidence: "s3",
            uncertain: "The document still leaves your device once; only the reuse is removed."
          },
          {
            n: 2, from: "Issuer", to: "Visitor",
            see: "A proof: over 18, scope, expiry — no birth date.",
            action: "The issuer signs a boolean claim rather than returning the date.",
            fields: ["proof", "scope", "expiry"],
            record: "Wallet / device: the proof",
            evidence: "s11",
            uncertain: "The issuer’s own copy of the document is governed by its retention policy, not by the proof."
          },
          {
            n: 3, from: "Visitor", to: "Service",
            see: "“Prove with your wallet”.",
            action: "The proof is presented; the service checks the issuer’s signature.",
            fields: ["proof", "signature", "timestamp"],
            record: "Service: valid / invalid",
            evidence: "s12",
            uncertain: "The service learns that this account holds a proof, which is itself a record."
          },
          {
            n: 4, from: "Service", to: "Visitor",
            see: "The page, or the same refusal screen.",
            action: "The service grants or denies access.",
            fields: ["the page, or a refusal screen"],
            record: "Service: valid / invalid, tied to the account",
            evidence: "s13",
            uncertain: "Nothing in the proof defines an appeal."
          }
        ]
      }
    },

    {
      id: "card",
      name: "Payment instrument",
      chip: "Card",
      gate_ask: "Add a card",
      gate_fields: ["Card details", "Billing address"],
      gate_fields_b: ["Bank app", "Consent"],
      gate_copy_a: "We only receive a yes or no answer. Method: credit card check.",
      gate_copy_b: "We only receive a proof that you are over 18. Method: bank-issued proof.",
      visible: ["a card form", "a processing spinner", "your bank’s own challenge", "pass or fail"],
      hidden: [
        "that the card goes to a payment processor and then to your bank",
        "that the check confirms a card issued to an adult, not the age of the person holding it",
        "that the card stays on file as the evidence",
        "that a borrowed card passes the same check"
      ],
      exclusion: "no credit card in your own name, or no bank willing to authorise",
      reference: {
        label: "Steam (Valve) UK age check",
        detail: "Card entered in Account Details, a £1 test authorisation, then the bank's own challenge; verified for as long as a valid credit card is stored.",
        url: "https://help.steampowered.com/en/faqs/view/292B-3DA3-CFC8-97F6"
      },
      reference_b: {
        label: "Open banking (Ofcom-listed method)",
        detail: "Ofcom lists open banking as capable of being highly effective; no public UK walkthrough exists, so the hops follow Ofcom's description and the EU wallet specification.",
        url: "https://www.ofcom.org.uk/online-safety/protecting-children/age-assurance"
      },
      chain: {
        default: ["Visitor", "Service", "Processor", "Issuing bank", "Service"],
        reworked: ["Visitor", "Bank", "Visitor", "Service"]
      },
      flow: {
        default: [
          {
            n: 1, from: "Visitor", to: "Service",
            see: "A payment form: card number, CVV, expiry, name, billing address.",
            action: "The gate asks for a card instead of a face or a document.",
            fields: ["card number", "CVV", "expiry", "name", "billing address"],
            record: "Service: the checkout form and the card details submitted into it",
            evidence: "s9",
            uncertain: "Debit cards are not treated as a valid age signal because they do not require the holder to be 18."
          },
          {
            n: 2, from: "Service", to: "Processor",
            see: "“Processing…”",
            action: "A small authorisation (Steam uses a £1 test charge it does not collect) goes through the payment processor.",
            fields: ["authorisation request", "amount", "merchant identifier"],
            record: "Processor: an authorisation log",
            evidence: "s9",
            uncertain: "The amount and the challenge method are set by the merchant and the bank, not by the visitor."
          },
          {
            n: 3, from: "Issuing bank", to: "Visitor",
            see: "A one-time code, or your banking app asking you to approve.",
            action: "The issuing bank challenges whoever holds the card.",
            fields: ["one-time code / app approval"],
            record: "Bank: the challenge and its outcome",
            evidence: "s9",
            uncertain: "The challenge proves control of the account, not that the person holding the card is an adult."
          },
          {
            n: 4, from: "Processor", to: "Service",
            see: "“Verified” — and the card stays on file.",
            action: "The authorisation returns; the account is treated as age-checked while a valid card is stored.",
            fields: ["approved / declined"],
            record: "Service: a card token and a “verified” flag",
            evidence: "s9",
            uncertain: "Ofcom asks for a check that the card belongs to the user; how that is done is not public."
          }
        ],
        reworked: [
          {
            n: 1, from: "Visitor", to: "Bank",
            see: "Your bank’s app: “Share only that you are over 18.”",
            action: "You consent to an age-only check with your own bank.",
            fields: ["consent", "account identifier"],
            record: "Bank: the consent and the check",
            evidence: "s2",
            uncertain: "Open banking age checks exist, but not every bank offers one."
          },
          {
            n: 2, from: "Bank", to: "Visitor",
            see: "A proof: over 18 — no balance, no transactions, no birth date.",
            action: "The bank returns a boolean attestation.",
            fields: ["over-18 claim", "signature", "expiry"],
            record: "Bank: the attestation it issued",
            evidence: "s14",
            uncertain: "Whether the bank learns which site you visited depends on the provider."
          },
          {
            n: 3, from: "Visitor", to: "Service",
            see: "“Prove with your bank”.",
            action: "The attestation is presented; the service verifies the bank’s signature.",
            fields: ["proof", "signature", "timestamp"],
            record: "Service: valid / invalid",
            evidence: "s12",
            uncertain: "An account links visits even when each proof is fresh."
          },
          {
            n: 4, from: "Service", to: "Visitor",
            see: "The page, or the same refusal screen.",
            action: "The service grants or denies access.",
            fields: ["the page, or a refusal screen"],
            record: "Service: valid / invalid, tied to the account",
            evidence: "s13",
            uncertain: "A bank that will not issue a proof leaves the person with no route at all."
          }
        ]
      }
    }
  ],

  /* ------------------------------------------------------- method compare */
  comparison_methods: {
    columns: ["Selfie", "Photo ID", "Card"],
    rows: [
      {
        dimension: "Documented reference",
        values: ["Yoti, as used by Instagram", "Yoti ID document check", "Steam (Valve), UK"],
        note: "Each chain is copied from a published product, not assembled from the category."
      },
      {
        dimension: "What leaves the browser",
        values: ["a burst of selfie frames", "a document photo and a selfie", "card number, CVV, billing address"],
        note: "Three different kinds of data, three different sensitivities."
      },
      {
        dimension: "Who receives it",
        values: ["an age-estimation provider", "a document-checking provider", "the payment processor, then your bank"],
        note: "Only the card route involves a party that already holds money data about you."
      },
      {
        dimension: "What comes back",
        values: ["over / under 18, sometimes a band", "pass / fail, sometimes a date of birth", "an authorisation — never a birth date"],
        note: "The card route returns the least age information of the three."
      },
      {
        dimension: "What the service keeps",
        values: ["the result, often against the account", "the result, plus a birth date if returned", "a card token and a verified flag"],
        note: "All three leave a record; the card route leaves a payment record."
      },
      {
        dimension: "What the third party keeps",
        values: ["the estimate and decision; images deleted, per policy", "the document, for a stated retention period", "the authorisation log"],
        note: "Retention is a policy statement in every case, not an observable fact."
      },
      {
        dimension: "Who cannot complete it",
        values: ["no camera, poor light, a face read as younger", "no passport, licence or accepted document", "no credit card at all — and nothing checks whose card it is"],
        note: "The three exclusions fall on different people."
      },
      {
        dimension: "What a false refusal costs",
        values: ["an identical refusal screen", "an identical refusal screen", "a declined card, and no appeal inside the gate"],
        note: "The interface renders error and correctness identically in all three."
      }
    ],
    reading: "The three routes share no step: what leaves the device, who receives it and what is kept differ at every hop."
  },

  /* -------------------------------------------------- arrangement compare */
  comparison: {
    rows: [
      {
        dimension: "Fields sent at the gate",
        default: "Face frames / document image / card details",
        reworked: "A proof, no image, no birth date, no card",
        note: "Fewer fields at the gate — after the first capture has already happened."
      },
      {
        dimension: "What the service stores",
        default: "Pass / fail, often tied to the account",
        reworked: "A valid / invalid proof state",
        note: "A single bit attached to an account is still a record."
      },
      {
        dimension: "What the third party keeps",
        default: "The estimate and decision; the document or the authorisation",
        reworked: "The original capture and the issued credential",
        note: "Retention moves, it does not disappear."
      },
      {
        dimension: "What a false “under 18” costs",
        default: "Access denied, no visible appeal",
        reworked: "Proof refused, no visible appeal",
        note: "The error is the same; the interface is quieter."
      }
    ],
    reading: "The reworked view reduces what travels at the gate. The first capture, the third party and the missing appeal remain."
  },

  /* ------------------------------------------------- per-step real anchors */
  stepReal: {
    "face:default:1": "MDN: an ordinary page request already carries the IP address, the user agent and the requested URL.",
    "face:default:2": "Instagram: after a video selfie, “we share an image from the selfie with Yoti”; Yoti: “Users capture a selfie using their device camera”, in a fast sequence.",
    "face:default:3": "Yoti: the business can receive the estimated age, or a signal that the user meets a threshold — under/over 13, 13–17, 18+, 21+; Instagram and Yoti then delete the image.",
    "face:default:4": "Yoti: images are “immediately, permanently deleted” — a statement reviewed under SOC 2 / PAS 1296, not something visible from outside.",

    "face:reworked:1": "Yoti reusable digital ID: the user “only needs to create their digital age card once”, then reuses it online and in person.",
    "face:reworked:2": "Yoti: age tokens “don’t contain any personal details, just the result of an age check and information around when and how it was performed”.",
    "face:reworked:3": "Yoti: the age is shared by scanning a QR code from the digital ID app, and can be saved as a Yoti Key (passkey) on the device.",
    "face:reworked:4": "Yoti: tokens “give users continued access to your site without having to prove their age again” — the site still decides who gets in.",

    "id:default:1": "MDN: the request is logged before any document is asked for; nothing age-specific has happened yet.",
    "id:default:2": "Yoti ID document check: “Users scan their ID document and capture a selfie”; documents from over 200 countries are accepted.",
    "id:default:3": "Yoti: “Yoti matches the selfie to the document and verifies authenticity”; the check “takes just one second on average”.",
    "id:default:4": "Yoti: “The business receives an over/under age result or year of age” — a year of age is the birth date in disguise.",

    "id:reworked:1": "Yoti: digital IDs “are created using verified identity details”, so the credential is issued only after a real document check.",
    "id:reworked:2": "Yoti: the digital ID app shares “a verified age”, not the document and not the date of birth.",
    "id:reworked:3": "Yoti: sharing happens by scanning a QR code, so nothing from the document is retyped at the gate.",
    "id:reworked:4": "Yoti: the token carries “when and how” the check was performed — itself a record attached to the visit.",

    "card:default:1": "Steam (UK): “Add a Payment method to this account”; required inputs are card type, number, CVV, expiry, name and billing address.",
    "card:default:2": "Steam: “For some cards this will show as a £1 test charge that Steam will not collect”.",
    "card:default:3": "Steam: “a challenge that is determined by your card issuing bank’s policies, e.g. via one-time-password (OTP) or via app”.",
    "card:default:4": "Steam: the account is “age verified for as long as a valid credit card is stored”; debit cards do not qualify.",

    "card:reworked:1": "Ofcom lists open banking as a method; no public walkthrough of a UK open-banking age check was found, so this hop is inferred.",
    "card:reworked:2": "EU age verification: a wallet returns a boolean claim (age_over_18) rather than a date of birth — the closest documented equivalent.",
    "card:reworked:3": "EU age verification: the service verifies the issuer's signature; the wallet shows only the claim requested.",
    "card:reworked:4": "No public implementation shows an appeal route inside a bank-issued proof; Steam's own answer is to contact the bank."
  },

  /* ------------------------------------------------------------- evidence */
  evidence: [
    {
      id: "s2",
      method: "All three",
      claim: "Facial age estimation, photo-ID matching and credit card checks are all methods Ofcom treats as capable of being highly effective at 18.",
      source: "Ofcom (2026) Age assurance duties under the Online Safety Act — the seven-method list.",
      url: "https://www.ofcom.org.uk/online-safety/illegal-and-harmful-content/age-assurance?language=en",
      status: "Regulator's published list. It also excludes debit-card checks and self-declaration."
    },
    {
      id: "s8",
      method: "All three",
      claim: "Before any age-specific step, the request already carries the address, the device and the URL.",
      source: "MDN Web Docs — HTTP headers.",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers",
      status: "Technical reference."
    },
    {
      id: "s3",
      method: "Selfie",
      claim: "A selfie check returns a threshold or a band, not a birth date; images are deleted per provider policy; reusable age tokens exist for returning visits.",
      source: "Yoti (2026) Age Assurance Tools — support documentation.",
      url: "https://support.yoti.com/article-detail?articleId=ka0Py00000087WHIAY&category=All%20Yoti%20age%20verification&product=Age%20Verification&type=Businesses",
      status: "Provider documentation: accurate for the flow, not independent evidence of deletion."
    },
    {
      id: "s9",
      method: "Card",
      claim: "A credit-card check runs card entry → £1 test authorisation → the bank's challenge → “verified while a valid credit card is stored”, with no birth date exchanged.",
      source: "Steam Support — Age Assurance under the UK Online Safety Act.",
      url: "https://help.steampowered.com/en/faqs/view/292B-3DA3-CFC8-97F6",
      status: "A live UK implementation, documented step by step by the platform itself."
    },
    {
      id: "s14",
      method: "Card",
      claim: "A card check binds the instrument, not the person; regulators treat “does the card belong to the user?” as the circumvention problem.",
      source: "Bird & Bird (2026) commentary on Ofcom's HEAA assessment.",
      url: "https://www.twobirds.com/en/insights/2026/uk/the-uks-ofcom-publishes-rapid-assessment-of-highly-effective-age-assurance-at-16-and-report-on-the-r",
      status: "Legal commentary; the instrument/person distinction is stated, not resolved."
    },
    {
      id: "s11",
      method: "Credential",
      claim: "An EU age proof is a boolean claim (age_over_18), disclosed without a birth date or a name.",
      source: "European Commission (2026) The Age Verification Manual — EU Digital Identity Wallet.",
      url: "https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/930450954/The+Age+Verification+Manual",
      status: "Commission specification of the use case."
    },
    {
      id: "s12",
      method: "Credential",
      claim: "Proofs are issued in batches for one-time use specifically to limit linkability; zero-knowledge proofs are still being added.",
      source: "European Commission — The EU approach to age verification.",
      url: "https://digital-strategy.ec.europa.eu/en/policies/eu-age-verification",
      status: "Policy page describing the design decision, not an outcome measurement."
    },
    {
      id: "s13",
      method: "All three",
      claim: "A false “minor” block is an automated decision; redress exists only outside the gate — DSA Articles 17 and 20, GDPR Article 22.",
      source: "AccountRights (2026) Age verification: false “minor” bans and remedies.",
      url: "https://accountrights.com/blog/age-verification-false-minor-bans",
      status: "Practitioner account of the routes a refused adult must use; no case data."
    }
  ],

  /* ----------------------------------------------------------- unresolved */
  unresolved: [
    {
      question: "Has Instagram deleted the selfie I sent?",
      detail: "Instagram says it shares one image from the video selfie with Yoti, and that both delete it after the estimate. I cannot see the deletion, and there is nothing I can ask for afterwards.",
      status: "Rests on the company's statement"
    },
    {
      question: "What is left after the 30 days for an uploaded ID?",
      detail: "Meta says an uploaded ID is deleted within 30 days. The birth date it confirms stays on the account, and I cannot see whether the image really goes.",
      status: "Stated, not shown"
    },
    {
      question: "What does WeChat keep for 90 days?",
      detail: "WeChat keeps the verification result, a hash of the face data, and a de-identified name and ID number for 90 days, then deletes or anonymises them. I cannot see that deletion, and a failed match is never explained.",
      status: "Stated, not shown"
    },
    {
      question: "How long does a card keep me verified on Steam?",
      detail: "Steam treats the account as age-verified for as long as a valid credit card is stored. Nothing in the £1 step asked whose card it was, and a refusal sends me to my bank, which does not explain it either.",
      status: "Documented, but unmeasured"
    },
    {
      question: "How often are adults refused by mistake?",
      detail: "None of the three publishes a refusal rate per service. I can see my own refusal; I cannot put it next to anyone else's.",
      status: "Not published"
    },
    {
      question: "Can I appeal inside the gate?",
      detail: "No. Instagram, WeChat and Steam each end with a pass or a fail. The routes to contest a decision sit outside the screen, and none of them is linked from it.",
      status: "No route inside"
    }
  ],

  /* -------------------------------------------------------------- sources */
  sourceGroups: [
    {
      group: "Services I used",
      items: [
        {
          title: "Instagram Help Center, 'How does video selfie age verification work on Instagram?'",
          url: "https://help.instagram.com/292521846402382",
          used_for: "The video selfie route: one image shared with Yoti, deleted after the estimate."
        },
        {
          title: "Meta (2022) 'Introducing new ways to verify age on Instagram'",
          url: "https://about.fb.com/news/2022/06/new-ways-to-verify-age-on-instagram/",
          used_for: "The ID route, and the 30-day deletion window for an uploaded document."
        },
        {
          title: "Yoti (2026) Age Assurance Tools, support documentation",
          url: "https://support.yoti.com/article-detail?articleId=ka0Py00000087WHIAY",
          used_for: "What a selfie check returns; the burst of frames; deletion policy; reusable age tokens."
        },
        {
          title: "Tencent (2026) WeChat face verification: personal information processing rules",
          url: "https://support.weixin.qq.com/cgi-bin/mmsupportacctnodeweb-bin/pages/VUgpb9zJlUNrtSg9",
          used_for: "The comparison with the identity record; the 90-day retention of the result and hash; the face image not being kept."
        },
        {
          title: "Steam Support, 'Age assurance under the UK Online Safety Act'",
          url: "https://help.steampowered.com/en/faqs/view/292B-3DA3-CFC8-97F6",
          used_for: "The card chain: card entry, £1 test authorisation, the bank's challenge, verified while a card is stored."
        }
      ]
    },
    {
      group: "Regulation and research",
      items: [
        {
          title: "Ofcom (2026) Age assurance duties under the Online Safety Act",
          url: "https://www.ofcom.org.uk/online-safety/illegal-and-harmful-content/age-assurance?language=en",
          used_for: "The seven methods treated as capable of being highly effective at 18; debit cards and self-declaration excluded."
        },
        {
          title: "Knight-Georgetown Institute (2026) Age Assurance Online: A Technical Assessment of Current Systems and their Limitations",
          url: "https://kgi.georgetown.edu/research-and-commentary/age-assurance-online/",
          used_for: "The signal comparison, and the finding that no single method satisfies all four criteria."
        },
        {
          title: "Information Commissioner's Office (2021) Age appropriate design: a code of practice for online services",
          url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/",
          used_for: "Design decisions taken in the child's interest."
        },
        {
          title: "Information Commissioner's Office, 'What is valid consent?'",
          url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/consent/what-is-valid-consent/",
          used_for: "Separating consent to a check from consent to what it captures."
        },
        {
          title: "European Commission, The Age Verification Manual (EU Digital Identity Wallet)",
          url: "https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/930450954/The+Age+Verification+Manual",
          used_for: "The boolean age claim, and selective disclosure in the 'with a proof' arrangement."
        },
        {
          title: "European Commission, 'The EU approach to age verification'",
          url: "https://digital-strategy.ec.europa.eu/en/policies/eu-age-verification",
          used_for: "Batch issuance and one-time proofs as an anti-linkability design."
        },
        {
          title: "MDN Web Docs, HTTP headers",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers",
          used_for: "What any request carries before an age check begins."
        },
        {
          title: "AccountRights (2026) 'Age verification: false minor bans and remedies'",
          url: "https://accountrights.com/blog/age-verification-false-minor-bans",
          used_for: "Where redress actually sits: DSA Articles 17 and 20, GDPR Article 22."
        },
        {
          title: "Bird & Bird (2026) 'Ofcom's rapid assessment of highly effective age assurance at 16'",
          url: "https://www.twobirds.com/en/insights/2026/uk/the-uks-ofcom-publishes-rapid-assessment-of-highly-effective-age-assurance-at-16-and-report-on-the-r",
          used_for: "The instrument/person distinction in card checks, and the circumvention question."
        }
      ]
    }
  ]
}
;
