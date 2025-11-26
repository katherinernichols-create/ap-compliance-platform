# AP Compliance Platform

A B2B SaaS platform helping Associated Providers (APs) demonstrate aged care compliance to Registered Providers (RPs).

## The Problem
APs must prove worker compliance to RPs, but current methods (email, spreadsheets) are inefficient and error-prone.

## The Solution
- APs manage worker credentials in one place
- AI-powered compliance checking via Gemini
- RPs get read-only compliance view via share link
- Export to CSV for record-keeping

## Tech Stack
- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **AI:** Google Gemini 2.0
- **Hosting:** Vercel

## MVP Goal
Working prototype by January 4, 2026 demonstrating:
AP → Add Worker → Add Credentials → AI Summary → Share with RP

## Getting Started
See issues labeled `MVP` and `Dev - Setup` in the project board.

Start with #1: Initialize Next.js App in Codespaces# ap-compliance-platform

## Deployment
Production URL: https://kora-compliance.vercel.app
