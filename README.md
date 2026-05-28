#  Phishing Email Analyzer

- An AI-powered phishing email analysis tool built for SOC (Security Operations Center) workflows. Paste raw email content and get an instant structured threat report powered by Claude AI.

## Features
- IOC extraction - automatically identifies malicious domains, URLs, IP addresses, and email addresses
- Severity Rating - classifies threats as CRITICAL, HIGH, MEDUIM, or LOW with confidence score
- Phishing Indicators- detects suspecious patterns in headers, sender info, and body content
- Social Engineering Detection - identifies urgency, impersonation, and fear-based manipulation tactics
- Escalation Flags - determines whether the threat requires immediate escalation and why
- Recommended Actions - outputs SOC-ready response steps

## Tech Stack

- React + Vite
- Anthropic Claude API (claude-sonnet-4-20250514)
- Deployed on Vercel

## Live Demo
https://phishing-email-analyzer-ma56.vercel.app

## Screenshot
<img width="1290" height="730" alt="SOC phishing analyzer" src="https://github.com/user-attachments/assets/834fa1c5-8c87-4194-a182-38454e3453a1" />

## How to Run Locally
1. Clone the Repository
2. Run npm install
3. Run npm run dev
4. Open http://localhost:5173

Note : You need an Antropic API key to run this locally.

## Purpose

Build as part of my cybersecurity portfolio to demonstrate SOC analyst skills, IOC identification, threat classification, and AI-augmented security worklfows.

## Author
AzureKodo

Aspiring SOC analyst | Aspiring Ethical Hacker | Cybersecurity

GitHub: https://github.com/AzureKodo-alt
