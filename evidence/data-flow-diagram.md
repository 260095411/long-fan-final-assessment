# Data flows — three signals, three chains (text diagrams)

The prototype no longer models one generic flow. Ofcom's guidance treats facial age estimation, photo-ID
matching and credit card checks as three separate methods capable of being highly effective at 18, and the
published provider flows are not interchangeable: they hand over different data, to different parties, and
leave different records. Each chain below is drawn from documentation cited in the prototype.

The names are roles, not contracts. No company's actual system was tested.

---

## Chain 1 — facial age estimation (View A)

Reference product: **Yoti Age Estimation** (Yoti Age Verification support documentation, "What are the
Age Assurance Tools that Yoti Age Verification offers?", updated 27 September 2026). Documented steps
quoted in the prototype: selfie captured on the device camera; multiple photos captured in a fast
sequence; the business receives either the estimated age or a threshold signal (under/over 13, 13–17,
18+, 21+); images "immediately, permanently deleted".

```
Visitor ──1. requests the page───────────────▶ Service
   │                                            │
   │◀──2. returns an age gate───────────────────┘
   │
   ├──3. selfie frames + site ID + timestamp──▶ Estimator (third-party)
   │                                            │
   │                                            ├──4. estimate + decision written
   │                                            ▼
   │                                        Estimator store
   │                                            │
   │◀──5. pass / fail (optionally a band)───────┘
   │
   └──6. content, or a refusal screen────────── Visitor
```

| Hop | Fields that travel | What the visitor sees | Evidence |
|---|---|---|---|
| 1 | IP address, user agent, URL, account session | nothing yet | ordinary HTTP request (MDN) |
| 2 | gate configuration, method list, notice | the gate | the interface |
| 3 | image frames, site identifier, timestamp, sometimes email or phone | camera window, “hold still” | provider documentation |
| 4 | estimate, decision, retention period, audit metadata | “verifying” | provider retention statements |
| 5 | over / under 18, optional band, signed token | “Verified” | the bit the gate advertises |
| 6 | page, or refusal screen | the denial | identical to a correct denial |

Uncertain: whether the frames are actually deleted (a policy statement), and whether the service also
stores the result against the account.

---

## Chain 2 — photo ID document (View A)

Reference product: **Yoti ID document check** (same Yoti support article). Documented steps quoted in
the prototype: "Users scan their ID document and capture a selfie"; documents from over 200 countries
accepted; Yoti "matches the selfie to the document and verifies authenticity"; "the business receives an
over/under age result or year of age"; average check time "just one second".

```
Visitor ──1. requests the page───────────────▶ Service
   │                                            │
   │◀──2. returns an age gate───────────────────┘
   │
   ├──3. document image + selfie + document no. ▶ ID checker (third-party)
   │       + name + date of birth                 │
   │                                              ├──4. authenticity + match + DOB
   │                                              ▼
   │                                          Checker store
   │                                              │
   │◀──5. pass / fail, sometimes DOB──────────────┘
   │
   └──6. content, or a refusal screen──────────── Visitor
```

| Hop | Fields that travel | What the visitor sees | Evidence |
|---|---|---|---|
| 1 | IP address, user agent, URL, account session | nothing yet | ordinary HTTP request |
| 2 | gate configuration, accepted documents | “Upload a photo ID” | the interface |
| 3 | document image, selfie, document number, name and date of birth | “photograph your document” | Ofcom method list; provider documentation |
| 4 | verification result, document retained for a stated period | “verifying” | provider retention statements |
| 5 | pass / fail, sometimes a date of birth | “Verified” | provider documentation |
| 6 | page, or refusal screen | the denial | identical to a correct denial |

Uncertain: whether a date of birth comes back with the answer, and for how long the document is kept.
This is the chain that returns the most identity data of the three.

---

## Chain 3 — credit card check (View A)

Reference product: **Steam (Valve), UK age assurance** (Steam Support, "Age Assurance under the UK Online
Safety Act", UK users only). Documented steps quoted in the prototype: "Add a Payment method to this
account"; required inputs are card type, number, CVV, expiry, name and billing address; "For some cards
this will show as a £1 test charge that Steam will not collect"; "a challenge that is determined by your
card issuing bank's policies, e.g. via one-time-password (OTP) or via app"; the account is "age verified
for as long as a valid credit card is stored"; debit cards do not qualify; a card that cannot be
registered is taken up with the bank.

```
Visitor ──1. enters card + billing address────▶ Service
   │                                            │
   │                                            ├──2. £0 authorisation──▶ Processor
   │                                            │                             │
   │◀──3. one-time code / bank app challenge────┼───────────── Issuing bank ◀─┘
   │                                            │                   │
   │                                            │◀──4. approved / declined
   │                                            ▼
   │                                      card token + “verified” flag
   │
   └──5. content, or a refusal screen──────────── Visitor
```

| Hop | Fields that travel | What the visitor sees | Evidence |
|---|---|---|---|
| 1 | card number, CVV, expiry, name, billing address | the payment form | Steam's published UK process |
| 2 | authorisation request, amount, merchant identifier | “Processing…” | same |
| 3 | one-time code / app approval | the bank's own challenge | same |
| 4 | approved / declined | “Verified”, card stays on file | same |
| 5 | page, or refusal screen | the denial | identical to a correct denial |

Uncertain: the challenge proves control of the account, not that the person holding the card is an adult.
Ofcom asks services to check that the card belongs to the user; how that is implemented is not public.
This is the chain that returns the least age information — no birth date ever — and the one that leaves a
payment record behind.

---

## What the comparison establishes

| | Selfie | Photo ID | Card |
|---|---|---|---|
| Reference product | Yoti Age Estimation | Yoti ID document check | Steam (Valve), UK |
| Leaves the browser | a short video | a document photo + selfie | card number, CVV, billing address |
| Received by | estimation provider | document-checking provider | processor, then issuing bank |
| Returns | over / under 18 | pass / fail, maybe DOB | an authorisation |
| Record left at the service | the result | the result, maybe DOB | card token + verified flag |
| Who cannot complete it | no camera, poor light | no passport or licence | no credit card in their name |

Three different exclusions, three different records, one identical refusal screen. That is the argument
the three chains are meant to make visible: the binary answer is the only thing the three methods share.

## The two places where every chain is uncertain

1. **Retention.** Deletion or a retention window is a policy statement in all three methods, not an
   observable event from outside.
2. **The write after the answer.** Whether the service stores the result is a database write the
   interface never shows. A one-bit answer attached to an account is still a record.

## Why diagrams rather than screenshots of real gates

A screenshot of a real gate shows the first screen and nothing else. The diagrams put the parties, the
fields and the asymmetries on one page, and mark exactly where the evidence stops.
