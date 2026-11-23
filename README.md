# 🍕 Krishu & Rishu Treat Pact

A private personal web tracker for our monthly food and contribution pact.

---

## 📌 The Rules
- **Treat #1 (Solo)** — One complete treat given solo.
- **Treat #2 (Solo)** — Second complete treat given solo.
- **Contri (Split)** — Chipped in / contributed for an outing.

---

## ⏳ Monthly Auto-Reset Cycle
- Resets automatically when the calendar month changes.
- Shared progress is stored in `deal-state.json`.

## ☁️ Cross-device setup
Deploy this project on Vercel and add these environment variables:
- `GITHUB_TOKEN`: a fine-grained GitHub token with read/write access to `deal-state.json`
- `GITHUB_REPO`: `Rishi-1010/treat-reporter`
- `GITHUB_BRANCH`: `main`

---

## 🚀 How to Run Locally
Open `index.html` directly in any web browser on your computer or phone.