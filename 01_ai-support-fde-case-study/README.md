# 🤖 AI Customer Support Resolution Platform

> An FDE-driven AI solution for intelligent customer-support automation,
> knowledge retrieval, business-system integration, and human escalation.

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)
![Tests](https://img.shields.io/badge/tests-7%2F7%20passing-brightgreen?logo=pytest&logoColor=white)
![Status](https://img.shields.io/badge/status-MVP-orange)
![License](https://img.shields.io/badge/license-Proprietary-lightgrey)

---

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

This project and its contents are original work created by **Mahesh Kumar,
Founder & CEO of SaffronyxAI.in**.

Unauthorized copying, reproduction, modification, redistribution, or
commercial use of this material, in whole or in part, is prohibited without
prior written permission from SaffronyxAI.in.

**Author:** Mahesh Kumar
**Role:** Founder & CEO
**Company:** SaffronyxAI.in

---

## 1. Project Overview

Retail support teams drown in the same handful of questions every day —
"where's my order," "reset my password," "when's my refund" — while the
genuinely hard cases wait in the same queue. This project is a Forward
Deployment Engineer (FDE) case study: a full walkthrough of turning that
mess into a controlled, measurable AI-support system, from client
discovery all the way to a working, tested prototype and a real deployment
plan.

It's not a chatbot demo. It's the engineering process an FDE actually runs
at a client: **discover → define → design → build → test → deploy → measure.**

## 2. Client Problem

A retail client fields thousands of support queries a day. Most are
repetitive — FAQs, order status, refunds, account resets — but they're
handled the same way as everything else: a human reads it, investigates
it, and answers it. That doesn't scale. Response times grow, answers get
inconsistent across agents, and complex cases lose context every time
they're handed off.

## 3. Business Impact

| Symptom | Effect |
|---|---|
| Repetitive queries eat agent time | Slower response on everything |
| No shared source of truth | Inconsistent answers across agents |
| Manual triage | Complex cases don't get to the right agent fast |
| Context lost on handoff | Customers repeat themselves |
| Headcount-bound scaling | Cost grows linearly with volume |

## 4. Proposed Solution

An **AI Support Agent** that classifies every incoming request, resolves
what it can safely resolve (FAQ answers via knowledge retrieval,
account/order lookups via business APIs), and routes everything else —
low-confidence, sensitive, or explicitly-requested — to a human, **with
full context attached** so nobody repeats themselves.

```
Customer → AI Support Agent → Intent Detection
                                     │
              ┌──────────────────────┼──────────────────────┐
              ▼                      ▼                      ▼
        FAQ / Knowledge        Account / Order         Complex / Risky
              │                      │                      │
        RAG Knowledge Base     Business APIs          Human Escalation
              │                      │                      │
              └──────────────────────┴──────────────────────┘
                                     ▼
                            Customer Resolution
```

## 5. Architecture

![AI Customer Support Resolution Platform Architecture](architecture-diagram.png)

Full breakdown — component responsibilities, request flow, design
principles, and how the MVP grows into the production system — lives in
[architecture.md](architecture.md). The client discovery behind these
decisions is in [requirements.md](requirements.md), and the rollout plan
is in [deployment-plan.md](deployment-plan.md).

## 6. Key Capabilities

- 🎯 **Intent detection** — classify what the customer actually wants
- 📚 **Knowledge retrieval / RAG** — answer from approved internal sources
- 🔌 **Business-system integration** — controlled, read/write-scoped API calls
- 🧑‍💻 **Human escalation** — with full context, not a cold handoff
- 📉 **Confidence-based routing** — low-confidence predictions never guess
- 📊 **Monitoring & evaluation** — every decision is measurable

## 7. MVP Scope

The current prototype proves the routing layer — the decision-making core
everything else plugs into. Given a customer question, it classifies into:

1. **FAQ**
2. **Account Issue**
3. **Order Issue**
4. **Refund Issue**
5. **Human Escalation**

No real customer data, no live APIs, no production infra — that's
deliberate. See [§13 Future Enhancements](#13-future-enhancements) for what
comes next.

## 8. Technology

- **Python 3.10+** — zero external runtime dependencies
- **Rule-based weighted keyword classification** — deterministic, debuggable,
  free to run, no API key required
- **pytest** — automated test suite

## 9. Project Structure

```
├── README.md               ← you are here
├── requirements.md          ← 63 client discovery questions across 9 areas
├── architecture.md          ← system design (MVP + production)
├── architecture-diagram.png
├── prototype.py              ← the working MVP
├── deployment-plan.md        ← MVP → pilot → production → monitoring
├── requirements.txt
├── .gitignore
└── tests/
    └── test_prototype.py     ← 7 automated tests
```

## 10. How to Run

```bash
git clone https://github.com/emkays-codelabs/ai-support-fde-case-study.git
cd ai-support-fde-case-study
```

**Create a virtual environment**

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
```

**Install and run**

```bash
pip install -r requirements.txt
python prototype.py
```

**Sample output**

```
Enter your question: Where is my order?

=============================================
AI CUSTOMER SUPPORT CLASSIFICATION
=============================================

Customer Question:
Where is my order?

Predicted Category:
Order Issue

Confidence:
100.00%

Recommended Action:
Continue with the appropriate AI support workflow.
=============================================
```

## 11. Testing

```bash
pytest -v
```

```
tests/test_prototype.py::test_faq PASSED
tests/test_prototype.py::test_account_issue PASSED
tests/test_prototype.py::test_order_issue PASSED
tests/test_prototype.py::test_refund_issue PASSED
tests/test_prototype.py::test_human_escalation PASSED
tests/test_prototype.py::test_specific_order_question PASSED
tests/test_prototype.py::test_unknown_request_escalates PASSED

======================== 7 passed in 0.03s ========================
```

## 12. Deployment Strategy

```
Requirement → Prototype → Testing & Evaluation → Pilot
    → Production → Monitoring → Continuous Improvement
```

Every phase has explicit objectives, deliverables, and exit criteria —
including a rollback strategy so a bad AI decision never becomes a client
incident. Full detail in [deployment-plan.md](deployment-plan.md).

## 13. Future Enhancements

The MVP intentionally stops at intent routing. The credible next steps:

- LLM-based intent classification (replacing the rule-based keyword matcher)
- RAG pipeline over real knowledge sources
- Vector database for semantic retrieval
- Live business-API integration (orders, refunds, CRM)
- Authentication & authorization
- Agentic orchestration across tools
- Production observability (latency, accuracy, escalation-rate dashboards)
- Full human-in-the-loop escalation workflow with a real ticketing system

## 14. FDE Perspective

The job of a Forward Deployment Engineer isn't to bolt AI onto a workflow
because it's technically possible — it's to answer, in order:

**What is the client's problem?**
↓
**Which parts of the workflow can safely be automated?**
↓
**What knowledge and systems does the AI actually need?**
↓
**Where must humans stay in the loop?**
↓
**How is this deployed, monitored, and proven to work?**

Everything in this repo — `requirements.md` → `architecture.md` →
`prototype.py` → `deployment-plan.md` — is that question chain answered
in order, with a working artifact at the end of each step.

---

## Copyright

© 2026 SaffronyxAI.in. All Rights Reserved.

**Created by:** Mahesh Kumar, Founder & CEO of SaffronyxAI.in
**Company:** SaffronyxAI.in
