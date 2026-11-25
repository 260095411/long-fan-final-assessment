# Data flow — one existing example (text diagram)

The prototype models the most common pattern: a service that does not check age itself, but delegates
the check to a third-party evaluator and receives a threshold result. It is the pattern described in
provider documentation and in the regulatory guidance; the specific companies named below are
examples of the roles, not claims about any single contract.

```
 ┌──────────┐   1. requests page      ┌────────────────────┐
 │ Visitor  │ ──────────────────────▶ │ Service (website)  │
 └──────────┘                         └────────────────────┘
      ▲                                          │
      │ 2. returns gate instead of content       │
      └──────────────────────────────────────────┘

      │ 3. submits signal (image / document + email)
      ▼
 ┌──────────────────────────────┐
 │ Evaluator (third party)      │   e.g. an age-estimation or ID-verification provider
 └──────────────────────────────┘
      │ 4. derives estimate, writes a record
      ▼
 ┌──────────────────────────────┐
 │ Evaluator storage            │   estimate · decision · retention window · audit metadata
 └──────────────────────────────┘
      │ 5. returns threshold result (pass / fail, optionally an age band)
      ▼
 ┌──────────────────────────┐
 │ Service                  │   stores the result, often against the account
 └──────────────────────────┘
      │ 6. grants or denies access
      ▼
 ┌──────────┐
 │ Visitor  │   sees content, or a refusal screen with no visible appeal route
 └──────────┘
```

## Fields per hop

| Hop | Fields that travel | Observable by the visitor? | Evidence |
|---|---|---|---|
| 1 | IP address, user agent, URL, session cookie | No | Ordinary HTTP request |
| 2 | Gate configuration, method list, privacy notice | Yes | The interface is the only inspectable part |
| 3 | Image frames or document image, email or phone, site identifier, timestamp | Partly (the browser's network panel shows a request to another domain) | Provider documentation; network inspection |
| 4 | Estimate, decision, retention period, audit metadata | No | Retention statements published by providers |
| 5 | Pass / fail, optional age band, signed token | Yes, as a single result | The "yes/no" the interface advertises |
| 6 | Page, or refusal screen | Yes | The refusal is visually identical to a correct one |

## The two places where the diagram is uncertain

1. **Hop 3→4.** Whether images are deleted after estimation is a policy statement, not an observable
   event from outside. The prototype labels this "asserted, not demonstrated".
2. **Hop 5→6.** Whether the service keeps the result is a database write the interface never shows.
   A one-bit answer attached to an account is still a record.

## Why this diagram rather than a screenshot

A screenshot of a real gate would show hop 2 and nothing else. The diagram is the argument: it puts the
three parties and their asymmetries on one page, and it marks exactly where the evidence stops.
