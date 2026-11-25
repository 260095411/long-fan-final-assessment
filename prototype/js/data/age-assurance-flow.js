/* Age-assurance flow dataset. Wrapped as a script so the prototype also runs when opened directly from disk (file:// blocks fetch). */
window.AGE_FLOW = {
  "meta": {
    "title": "The Yes/No Contract",
    "subtitle": "What an age gate actually exchanges, and who carries the error",
    "threshold": 18,
    "disclaimer": "Simulated data only. No photographs, documents or personal details are collected, stored or transmitted by this prototype. Fields and flows are modelled on published provider documentation and regulatory guidance; every uncertain step is labelled as uncertain in the interface.",
    "stack": "Stack 2 — Infrastructure, Tools and Code: the request, the evaluator, the record and the token returned."
  },
  "methods": [
    {
      "id": "face",
      "name": "Facial age estimation",
      "signal": "Age estimation from a short video selfie",
      "user_provides": ["a video selfie (frames of the face)", "an email address or phone number", "consent to the check"],
      "evaluator_receives": ["image frames", "estimated age or age band", "request timestamp", "a site identifier"],
      "evaluator_states_it_retains": ["the age estimate and the decision", "the request metadata", "not the images, per provider policy"],
      "service_receives": ["a pass / fail result", "sometimes an age band, not a date of birth"],
      "accuracy_note": "Estimation error is larger near the threshold, and the error is not evenly distributed across faces.",
      "availability_note": "Works without documents, so it is the most available signal; it still requires a camera, reasonable lighting and a face the model can read.",
      "source": "s1"
    },
    {
      "id": "id",
      "name": "Photo ID document",
      "signal": "Government-issued identity document, checked by a third party",
      "user_provides": ["a photograph of an ID document", "often a selfie for matching", "name and date of birth printed on the document"],
      "evaluator_receives": ["the document image", "the selfie", "document number and date of birth", "request metadata"],
      "evaluator_states_it_retains": ["the verification result", "a retention window for the document, which varies by provider and jurisdiction"],
      "service_receives": ["a pass / fail result", "sometimes date of birth, which is more than a threshold"],
      "accuracy_note": "High baseline accuracy against the document, but the check also verifies that the document is real and belongs to the person.",
      "availability_note": "Excludes people without a passport or driving licence, including many children, care leavers and recent arrivals.",
      "source": "s2"
    },
    {
      "id": "card",
      "name": "Payment instrument",
      "signal": "A card or bank account that is legally restricted to adults",
      "user_provides": ["card number or bank authorisation", "billing details", "sometimes a small holding charge"],
      "evaluator_receives": ["a authorisation response from the bank", "billing country", "request metadata"],
      "evaluator_states_it_retains": ["the authorisation result, not the full card number"],
      "service_receives": ["a pass / fail result"],
      "accuracy_note": "Accurate for the instrument, not for the person holding it: a child can use an adult's card with permission.",
      "availability_note": "Requires a bank account and an adult willing to lend it, which is an unequal starting point.",
      "source": "s3"
    }
  ],
  "flow": [
    {
      "step": 1,
      "from": "Visitor",
      "to": "Service (the website)",
      "action": "Requests the age-restricted page",
      "fields": ["IP address", "user agent", "requested URL", "account session if logged in"],
      "evidence": "Ordinary HTTP request; nothing here is specific to age assurance.",
      "uncertainty": "Whether the account is required before the gate varies by service."
    },
    {
      "step": 2,
      "from": "Service",
      "to": "Visitor",
      "action": "Returns an age gate instead of the content",
      "fields": ["gate configuration", "list of accepted methods", "privacy notice text"],
      "evidence": "The interface is the only part of the system the visitor can inspect.",
      "uncertainty": "The notice may describe the evaluator's retention, not the service's own record."
    },
    {
      "step": 3,
      "from": "Visitor",
      "to": "Evaluator (third party)",
      "action": "Submits the chosen signal",
      "fields": ["image frames or document image", "email or phone", "site identifier", "timestamp"],
      "evidence": "The submission is a separate request to a different domain, often visible in the browser's network panel.",
      "uncertainty": "Exactly which fields are attached is not disclosed in the interface; it is documented, if at all, in a privacy notice."
    },
    {
      "step": 4,
      "from": "Evaluator",
      "to": "Evaluator's own storage",
      "action": "Derives an age estimate and writes a record",
      "fields": ["age estimate", "decision", "retention period", "audit metadata"],
      "evidence": "Providers publish retention statements; the record itself is not observable from outside.",
      "uncertainty": "Deletion is asserted, not demonstrated. There is no independent proof that images were discarded."
    },
    {
      "step": 5,
      "from": "Evaluator",
      "to": "Service",
      "action": "Returns a threshold result",
      "fields": ["pass / fail (over or under 18)", "optionally an age band", "a signed token"],
      "evidence": "This is the 'yes/no' the interface advertises.",
      "uncertainty": "The service may still store the result against the account, which is a record even when the answer is one bit."
    },
    {
      "step": 6,
      "from": "Service",
      "to": "Visitor",
      "action": "Grants or denies access",
      "fields": ["the page, or a refusal screen"],
      "evidence": "A denial looks identical whether the estimate was wrong or the person genuinely is under 18.",
      "uncertainty": "No appeal route is visible in most implementations; whether one exists is a policy choice."
    }
  ],
  "views": {
    "default": {
      "label": "View A — As deployed",
      "rule": "One signal, one decision, no visible record.",
      "steps": [
        "The gate asks for a selfie or a document.",
        "The signal leaves the service and goes to a third-party evaluator.",
        "The evaluator returns pass or fail.",
        "The service stores the result and lets the visitor in, or turns them away."
      ],
      "visible_to_visitor": ["the gate", "the privacy notice", "pass or fail"],
      "hidden_from_visitor": [
        "which fields travel with the signal",
        "how long the evaluator keeps the record",
        "what the service stores after the answer",
        "whether a failed adult has any route back"
      ]
    },
    "reworked": {
      "label": "View B — Same threshold, different arrangement",
      "rule": "A reusable threshold credential: the evaluator returns a proof that the holder is over 18, and the service stores only the proof.",
      "steps": [
        "The visitor obtains a credential once, from an evaluator they choose.",
        "The credential proves 'over 18' without carrying a date of birth or a document.",
        "The service checks the proof and stores nothing but a valid / invalid state.",
        "Re-presenting the credential on another site does not require a new document."
      ],
      "visible_to_visitor": ["the credential", "the scope of the proof", "when it expires"],
      "hidden_from_visitor": [
        "the evaluator still saw the original document or face",
        "the credential can link visits if it is presented with an account",
        "a rejected applicant has no way to contest the decision"
      ]
    }
  },
  "comparison": {
    "rows": [
      {
        "dimension": "Fields sent at the gate",
        "default": "Face frames / document image + email or phone",
        "reworked": "A proof, no image and no date of birth",
        "note": "Fewer fields, but the original capture already happened once."
      },
      {
        "dimension": "What the service stores",
        "default": "Pass / fail, often tied to the account",
        "reworked": "A valid / invalid proof state",
        "note": "A single bit attached to an account is still a record."
      },
      {
        "dimension": "What the evaluator keeps",
        "default": "Estimate and decision; documents for a stated period",
        "reworked": "The original capture and the issued credential",
        "note": "Retention moves, it does not disappear."
      },
      {
        "dimension": "Who can complete the check",
        "default": "Anyone with a camera or a document",
        "reworked": "Anyone with a compatible wallet and a credential",
        "note": "Availability changes shape; it does not necessarily improve."
      },
      {
        "dimension": "What a false 'under 18' costs",
        "default": "Access denied, with no visible appeal",
        "reworked": "Credential refused, with no visible appeal",
        "note": "The error is the same; the interface is quieter."
      }
    ],
    "reading": "The reworked view reduces what travels at the gate but does not remove the evaluator, the initial capture, or the asymmetry of a binary answer. That is the point: the arrangement is not a solution."
  },
  "remains": [
    {
      "item": "The original capture",
      "detail": "A credential can be reused, but the face or document was still submitted once, to someone."
    },
    {
      "item": "Binary answers hide error",
      "detail": "Pass and fail look the same whether the estimate was right or wrong; the person cannot tell which happened."
    },
    {
      "item": "No appeal route",
      "detail": "Nothing in either view lets a wrongly rejected adult contest the result, which is the asymmetry KGI describes as availability."
    },
    {
      "item": "Linking through accounts",
      "detail": "Even a threshold proof can be joined to an account, a device and a timestamp."
    },
    {
      "item": "Jurisdiction",
      "detail": "Enforcement depends on knowing where the visitor is, which usually means trusting an IP address."
    }
  ],
  "evidence": [
    {
      "id": "s1",
      "claim": "Facial age estimation returns an estimate, not a date of birth, and error rises near the threshold.",
      "source": "Knight-Georgetown Institute (2026) Age Assurance Online: A Technical Assessment of Current Systems and their Limitations, pp. on age estimation.",
      "url": "https://kgi.georgetown.edu/research-and-commentary/age-assurance-online/",
      "status": "Reported by an independent technical assessment."
    },
    {
      "id": "s2",
      "claim": "ID-document checks trade availability for accuracy: they exclude people without documents.",
      "source": "KGI (2026), criteria: baseline accuracy, circumvention resistance, availability, privacy.",
      "url": "https://kgi.georgetown.edu/research-and-commentary/age-assurance-online/",
      "status": "Stated as a structural trade-off across signals."
    },
    {
      "id": "s3",
      "claim": "Payment instruments are accurate for the instrument, not for the person.",
      "source": "Ofcom (2026) Guidance on highly effective age assurance, criteria and principles.",
      "url": "https://www.ofcom.org.uk/online-safety/protecting-children/age-assurance",
      "status": "Regulatory guidance; the instrument/person distinction is ours."
    },
    {
      "id": "s4",
      "claim": "Regulators require accuracy, robustness, reliability and fairness, plus accessibility and interoperability.",
      "source": "Ofcom (2026) Guidance on highly effective age assurance.",
      "url": "https://www.ofcom.org.uk/online-safety/protecting-children/age-assurance",
      "status": "Directly quoted criteria."
    },
    {
      "id": "s5",
      "claim": "No single age signal is sufficient; every system either risks accuracy or blocks eligible adults.",
      "source": "KGI (2026) summary of findings.",
      "url": "https://kgi.georgetown.edu/news/new-report-offers-comprehensive-technical-assessment-of-online-age-assurance-systems/",
      "status": "Report's headline finding."
    },
    {
      "id": "s6",
      "claim": "Consent to a check is not the same as consent to a particular use of the data captured during it.",
      "source": "ICO guidance on valid consent.",
      "url": "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/consent/what-is-valid-consent/",
      "status": "Guidance; the application to age gates is ours."
    },
    {
      "id": "s7",
      "claim": "Children's data protection expectations are set out in the Age Appropriate Design Code.",
      "source": "ICO (2021) Age Appropriate Design Code, application section.",
      "url": "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/",
      "status": "Statutory code."
    }
  ],
  "unresolved": [
    {
      "question": "Are the images actually deleted?",
      "why": "Providers state retention limits; deletion is not independently observable.",
      "status": "Unverifiable from outside."
    },
    {
      "question": "How often is an adult wrongly rejected?",
      "why": "Error rates are published as aggregate metrics, not as user-facing appeal data.",
      "status": "Not disclosed per service."
    },
    {
      "question": "Does the service keep the answer?",
      "why": "The interface shows the decision, not the database write behind it.",
      "status": "Hidden."
    },
    {
      "question": "What happens to people who cannot complete any method?",
      "why": "Availability is a criterion, but exclusion is only visible as a refusal screen.",
      "status": "Observed here as a simulated denial; not quantified."
    }
  ],
  "sources": [
    {
      "title": "Knight-Georgetown Institute (2026) Age Assurance Online: A Technical Assessment of Current Systems and their Limitations",
      "url": "https://kgi.georgetown.edu/research-and-commentary/age-assurance-online/",
      "used_for": "Signal comparison; four assessment criteria; headline finding."
    },
    {
      "title": "Ofcom — Age assurance duties under the Online Safety Act",
      "url": "https://www.ofcom.org.uk/online-safety/protecting-children/age-assurance",
      "used_for": "HEAA criteria and the accessibility principle."
    },
    {
      "title": "Ofcom and ICO — Joint statement on age assurance",
      "url": "https://www.ofcom.org.uk/siteassets/resources/documents/online-safety/information-for-industry/other/ofcom-ico-joint-statement-on-age-assurance.pdf",
      "used_for": "How the duties and data protection duties interact."
    },
    {
      "title": "ICO — What is valid consent?",
      "url": "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/consent/what-is-valid-consent/",
      "used_for": "Separating consent to a check from consent to a use."
    },
    {
      "title": "ICO — Age Appropriate Design Code",
      "url": "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/",
      "used_for": "Children's data expectations."
    },
    {
      "title": "MDN Web Docs — HTTP headers",
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers",
      "used_for": "What a request technically carries before any age check begins."
    }
  ]
}
;
