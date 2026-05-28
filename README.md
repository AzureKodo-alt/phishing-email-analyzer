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

