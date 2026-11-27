# Short research summary

*(The three-part update requested in the Week 9 tutorial: research summary, data-flow diagram, and the
one specific issue the prototype investigates.)*

## 1. What the research establishes

**Age assurance is now a regulatory requirement, not a product choice.** Under the UK Online Safety Act,
services likely to be accessed by children must use age assurance that Ofcom considers *highly effective*.
Ofcom's criteria are technical accuracy, robustness, reliability and fairness, with two principles to
have regard to: accessibility and interoperability (Ofcom, 2026; Ofcom and ICO, 2026).

**No signal satisfies every criterion.** The Knight-Georgetown Institute's technical assessment
(Rescorla, Arnao and Cooper, 2026) evaluates the common architectures — server-based evaluation,
device-based evaluation, and device-based evaluation with server-based enforcement — against baseline
accuracy, circumvention resistance, availability and privacy. Its headline finding is blunt: every
signal either risks accuracy or excludes eligible adults. There is no arrangement that blocks all minors
without also blocking large numbers of adults.

**The interface is the least informative part of the system.** A gate can be implemented so that the
provider returns only a threshold result, rather than a date of birth or an identity. That is a real
privacy gain at the point of return. It is not evidence about the point of capture: an image or a
document still left the browser, and a record of the decision still exists somewhere.

## 2. Where the data goes (see `data-flow-diagram.md`)

No single flow covers all three methods. Ofcom treats facial age estimation, photo-ID matching and
payment checks as separate methods capable of being highly effective at 18, and the published provider
documentation describes different exchanges for each:

- **Selfie** — the image frames and a site identifier go to an estimation provider, which returns a
  threshold and keeps a record.
- **Photo ID** — a document image, a selfie, a document number and a date of birth go to a checking
  company, which returns a verdict and sometimes the date of birth itself.
- **Card** — card details go to a payment processor for a £1 test authorisation; the issuing bank adds
  its own challenge; the service ends up holding a token and a verified flag, and never an age.

The shared asymmetry is that everything identifying happens before the answer, and the answer is all the
person is told. The difference is what that answer costs: a birth date in one case, a payment instrument
in another, a deleted image in the third.

## 3. What is contested, and what is open

Contested: whether threshold results are privacy-preserving when the capture is an image of a face;
whether "consent" to a check can be meaningful when the alternative is losing access; whether a
reusable credential improves availability or merely relocates the exclusion.

Open: deletion is asserted by providers and cannot be independently observed. Error rates are published
as aggregate metrics, not as appeal data. The number of partners who see a verification event is not
disclosed to the person being verified.

## 4. The one issue this prototype investigates

> **The binary answer conceals both the record and the error.**

A gate presents a single bit as if it were the whole exchange. That bit (a) is produced from an image or
a document that left the browser, (b) is stored by the service, often against an account, and (c) cannot
be inspected or contested by the person it describes. A false "under 18" and a correct "under 18" render
identically.

This is a specific, evidenced claim rather than a general worry about age checks: it rests on the KGI
assessment's availability finding, on Ofcom's accuracy and fairness criteria, and on the documented
structure of the flow. The prototype does not argue that age assurance is good or bad, and it does not
propose a fix.

## References

- Knight-Georgetown Institute (2026) *Age Assurance Online: A Technical Assessment of Current Systems and their Limitations*. Available at: https://kgi.georgetown.edu/research-and-commentary/age-assurance-online/ (Accessed: 25 November 2026).
- Ofcom (2026) *Age assurance duties under the Online Safety Act*. Available at: https://www.ofcom.org.uk/online-safety/protecting-children/age-assurance (Accessed: 25 November 2026).
- Ofcom and Information Commissioner's Office (2026) *Age assurance: a joint statement*. Available at: https://www.ofcom.org.uk/ (Accessed: 25 November 2026).
- Information Commissioner's Office (2021) *Age appropriate design: a code of practice for online services*. Wilmslow: ICO.
