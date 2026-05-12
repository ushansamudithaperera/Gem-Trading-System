# 💎 GemTrader – Enterprise B2B Gemstone Trading & Management Platform

[![CI](https://github.com/yourusername/gem-trading-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/gem-trading-platform/actions/workflows/ci.yml)
[![Deploy Backend](https://github.com/yourusername/gem-trading-platform/actions/workflows/cd-backend.yml/badge.svg)](https://github.com/yourusername/gem-trading-platform/actions/workflows/cd-backend.yml)
[![Deploy Frontend](https://github.com/yourusername/gem-trading-platform/actions/workflows/cd-frontend.yml/badge.svg)](https://github.com/yourusername/gem-trading-platform/actions/workflows/cd-frontend.yml)
[![Docker Pulls](https://img.shields.io/docker/pulls/yourusername/gem-backend)](https://hub.docker.com/r/yourusername/gem-backend)

**A Production-Ready Hybrid Marketplace + ERP System for the Sri Lankan Gem Industry**  
Built with MERN Stack + TypeScript, featuring Escrow Payments, Real-time Notifications, AI-powered Gem Classification, and Full DevOps CI/CD.

---

## 🚀 Key Features

- **Hybrid Marketplace** – Buy/sell rough & polished gemstones with escrow protection.
- **Service Hub** – Hire verified cutters, track cutting progress live.
- **Dynamic Role System** – Single user can be Buyer, Seller, and Cutter simultaneously.
- **Escrow + Auto-Release** – Funds held via Stripe mock (or real). Auto-release starts ONLY after courier confirms delivery.
- **Dispute Resolution** – Pause escrow, file disputes with evidence, admin resolution.
- **Real-time Notifications** – Socket.IO for instant updates on orders, cutting, disputes.
- **AI Microservice** – Python FastAPI for gemstone classification & price prediction (deployable free).
- **Multi-channel Alerts** – In-app + Email (Nodemailer) with legal record.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI, Redux Toolkit, Framer Motion |
| **Backend** | Node.js, Express.js, TypeScript, MongoDB (Mongoose), Redis (Upstash) |
| **Real-time** | Socket.IO |
| **AI** | Python, FastAPI, TensorFlow/PyTorch (optional) |
| **DevOps** | Docker, GitHub Actions CI/CD, Render (Backend), Vercel (Frontend), MongoDB Atlas |
| **Testing** | Jest, Supertest (Backend), Vitest, React Testing Library (Frontend) |
| **Logging** | Winston + Morgan |
| **Documentation** | Swagger/OpenAPI |

---

## 📁 Project Structure
