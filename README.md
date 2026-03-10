🚀 WebhookOS Frontend

A modern Webhook Management Dashboard built with Next.js 14, TypeScript, and TanStack React Query.

WebhookOS allows developers to create, monitor, test, and manage webhook systems from a powerful and developer-friendly interface.

The platform provides tools for event inspection, endpoint management, alert configuration, payload transformations, and webhook debugging.

🚀 Core Features
🔗 Webhook Endpoint Management

Create and manage webhook endpoints

Secure secret signing

Endpoint status tracking

Delivery retry visibility

Endpoint configuration dashboard

📊 Webhook Event Monitoring

View incoming webhook events

Inspect:

Headers
Payload
Response
Status Codes

Debug failed deliveries

Event history tracking

🚨 Alerts & Monitoring

Create webhook alert rules

Condition-based monitoring

Event failure alerts

Delivery health monitoring

🔑 API Key Management

Generate API keys

Revoke compromised keys

Secure API access for integrations

🔄 Payload Transformations

Modify webhook payloads

Apply custom transformation logic

Prepare events before processing

🧪 Developer Playground

Interactive environment to:

Test webhook signatures

Send mock payloads

Debug webhook integrations

👥 Customer Portal

Generate shareable portal links

Allow customers to manage webhook endpoints

Secure self-service integration portal

🛡 Admin Panel

User management

System audit logs

Platform monitoring

🎨 UI Features

🌙 Dark Mode (Default)

☀️ Light Mode Support

📱 Fully Responsive UI

⚡ Fast client-side data fetching

🧩 Modular component architecture

🛠 Tech Stack
<div align="center"> <img src="https://skillicons.dev/icons?i=nextjs,react,typescript,nodejs,git,github" /> </div>
Layer	Technology
Framework	Next.js 14 (App Router)
Language	TypeScript
Styling	CSS Modules + CSS Variables
State Management	Zustand
Data Fetching	TanStack React Query
Icons	Lucide React
Authentication	JWT (Cookie Based)
Package Manager	npm
🏗 System Architecture
📁 Project Structure
whk-frontend-v5
│
├── src
│   ├── app
│   │   ├── (app)
│   │   │   ├── dashboard
│   │   │   ├── endpoints
│   │   │   ├── events
│   │   │   ├── alerts
│   │   │   ├── api-keys
│   │   │   ├── transformations
│   │   │   ├── playground
│   │   │   ├── portal
│   │   │   └── admin
│   │
│   │   ├── auth
│   │   └── globals.css
│   │
│   ├── components
│   │   └── layout
│   │       └── AppShell.tsx
│   │
│   ├── lib
│   │   └── api.ts
│   │
│   └── store
│       └── Zustand state
│
├── public
│   └── logo.svg
│
├── next.config.js
├── tsconfig.json
└── package.json
⚙️ Installation
git clone https://github.com/YOUR_USERNAME/whk-frontend-v5.git
cd whk-frontend-v5
npm install
npm run dev
🔧 Environment Variables

Create .env.local

NEXT_PUBLIC_API_URL=http://localhost:8000
🚀 Run Development Server
npm run dev

Open:

http://localhost:3000
🏭 Production Build
npm run build
npm start
🔐 Authentication

Authentication is handled using JWT cookies.

Protected routes are organized inside:

src/app/(app)
👨‍💻 Author

Anuj Kumar

Backend Developer | NestJS | Node.js | Webhook Systems | API Integrations

⭐ If you find this project useful, consider giving it a star on GitHub.
