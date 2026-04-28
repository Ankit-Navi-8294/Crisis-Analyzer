# Project Detail: Global Economic Risk Analyzer

## 1. Project Overview
The **Global Economic Risk Analyzer** is a state-of-the-art geopolitical intelligence platform. It leverages AI to monitor live global news, identify critical economic threats, and provide executive-level analysis on their potential impact on global markets and specific countries.

---

## 2. Problem Statement
In today's volatile world, businesses and economists struggle to keep up with the sheer volume of news. Identifying which events (wars, natural disasters, financial collapses) actually pose a systemic risk requires hours of manual analysis.

---

## 3. The Solution
An automated, AI-driven dashboard that:
1. **Aggregates**: Scans thousands of news sources in real-time.
2. **Filters**: Uses AI to discard "noise" and focus only on high-impact crises.
3. **Analyzes**: Generates detailed reports on Short-term/Long-term impact and Risk Levels.
4. **Visualizes**: Displays risks on a global map and data-rich cards.

---

## 4. Key Features
- **Live Crisis Ticker**: Continuous stream of high-priority global telemetry.
- **AI Filtering Engine**: Uses Google Gemini to select the top 9 most significant global events.
- **Deep Impact Analysis**: Provides specific Economic Impact, Short-term Consequences (1-6 months), and Long-term Outlook (1-3 years).
- **Actionable Recommendations**: AI-generated suggestions for businesses to mitigate risks.
- **Executive Briefing Export**: One-click "Export to PDF" feature for sharing reports.
- **Interactive AI Chatbot**: Users can ask follow-up questions about any specific crisis.

---

## 5. Technology Stack
### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Modern CSS with Glassmorphism and Dark Mode aesthetics.
- **Routing**: React Router 7.
- **Visualization**: Recharts for data density.
- **Exporting**: React-to-Print for PDF generation.

### Backend
- **Framework**: Spring Boot 3 (Java 21).
- **API Communication**: Spring WebClient (Reactive) for non-blocking API calls.
- **Database**: MongoDB (for caching AI analysis results).
- **Security**: CORS-ready for cross-platform integration.

### External APIs
- **NewsAPI**: For real-time global news aggregation.
- **Google Gemini 2.0 Flash**: For advanced geopolitical and economic reasoning.

---

## 6. Deployment & Infrastructure
- **Frontend**: Hosted on **Vercel** (https://crisis-analyzer.vercel.app).
- **Backend**: Hosted on **Render** (https://crisis-analyzer.onrender.com).
- **Database**: Cloud-hosted on **MongoDB Atlas**.
- **CI/CD**: Automatic deployment triggered via GitHub.

---

## 7. Future Roadmap
- **Interactive Map Layers**: Heatmaps showing real-time economic destabilization.
- **Multi-Source News**: Integration with Twitter (X) and Bloomberg for faster alerts.
- **User Alerts**: Push notifications and email summaries for "High Risk" events.
- **Custom Portfolios**: Allow users to monitor risks specific to their business sectors.

---

## 8. PPT Slide Structure Suggestions
- **Slide 1**: Title & Tagline (Global Economic Risk Analyzer - AI-Powered Intelligence).
- **Slide 2**: The Problem (Information Overload & Geopolitical Uncertainty).
- **Slide 3**: The Solution (Automated AI Intelligence).
- **Slide 4**: Core Features (Map, Analysis Cards, PDF Export).
- **Slide 5**: Technical Architecture (React -> Spring Boot -> Gemini AI -> MongoDB).
- **Slide 6**: Live Demo / UI Screenshots.
- **Slide 7**: Future Scope & Impact.
