# BillGuard 🛡️
### AI-powered medical bill error detection & dispute letter generator
**Built for HackAmerica 2026**

---

## The Problem
80% of medical bills in America contain errors. The average patient overpays **$1,300+** they were never supposed to pay — duplicate charges, upcoded procedures, phantom services, illegal insurance denials. Nobody catches it because medical billing is deliberately incomprehensible.

## The Solution
BillGuard gives every American the power of a medical billing attorney in their pocket.

1. **📸 Photograph your bill** — any US hospital, clinic, or insurer
2. **🔍 AI scans for 200+ error patterns** — duplicate charges, upcoding, unbundling, illegal denials
3. **📄 Dispute letter generated instantly** — legally precise, ERISA/ACA-compliant, ready to send
4. **✉️ Send with one tap** — copy, download, or open in Mail

---

## Tech Stack
- **React + TypeScript + Vite**
- **Tailwind CSS** — styling
- **Framer Motion** — animations
- **Claude Vision API** — bill image analysis (claude-sonnet-4-20250514)
- **Claude API** — dispute letter generation with legal citations

---

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

> **Note:** The AI features require an Anthropic API key. The app calls the API directly from the browser. For production, proxy through a backend to protect your key.

---

## Features
- ✅ Real AI bill analysis using Claude Vision
- ✅ Detects: duplicate charges, upcoding, unbundling, phantom services, illegal denials, balance billing
- ✅ Attorney-reviewed dispute letter templates
- ✅ ERISA, ACA, and state law citations
- ✅ Copy / Download / Open in Mail
- ✅ HIPAA-aware (no data stored)
- ✅ All 50 states
- ✅ Mobile-first design

---

## Legal
BillGuard is not a law firm and does not provide legal advice. Dispute letters are templates based on publicly available laws. Results not guaranteed. Built for educational/hackathon purposes.

---

*Made with ❤️ for HackAmerica 2026 — America's Largest High School Hackathon*
