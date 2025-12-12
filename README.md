# Scholarship Quest 🎓🚀

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-4-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css&logoColor=white)

**Scholarship Quest** is an immersive, gamified web application designed to transform the often tedious process of finding scholarships into an engaging adventure. Built with modern web technologies, it guides users through a multi-step journey to discover personalized educational opportunities.

## ✨ Key Features

-   **🎮 Gamified Experience**:
    -   **XP & Leveling System**: Users earn XP and level up as they complete profile sections.
    -   **Achievements**: Unlockable badges for milestones (e.g., "Profile Master").
    -   **Interactive UI**: Animations, particle effects (confetti), and a dynamic starfield background.

-   **🌍 Multi-Language Support**:
    -   Full internationalization (i18n) support for **English**, **French**, **Spanish**, and **Arabic**.
    -   RTL support for Arabic layouts.

-   **🧠 Smart Form Management**:
    -   **Step-by-Step Wizard**: Broken down into digestible sections (Personal, Education, Goals, Experience, Preferences).
    -   **Persistence**: LocalStorage integration ensures users don't lose progress if they leave the page.
    -   **Validation**: Robust form validation with immediate feedback.

-   **📊 Dynamic Results & Insights**:
    -   **AI-Driven Matching**: (Simulated) algorithm to match users with universities and scholarships based on their profile.
    -   **Success Probability**: Visual indicators of acceptance chances.
    -   **PDF Generation**: Export personalized action plans and application checklists to PDF.

## ⚙️ Backend Architecture (n8n Workflow)

The application uses **n8n** for sophisticated backend orchestration, ensuring security, reliability, and intelligent processing.

-   **🛡️ Security & Validation**:
    -   **hCaptcha**: Bot protection verification.
    -   **Rate Limiting**: Postgres-backed tracking to prevent abuse (3 requests/day limit).
    -   **Input Validation**: Strict schema validation for email and profile data.

-   **🧠 Multi-Stage AI Pipeline**:
    1.  **Context Injection**: Injects verified tuition ranges and scholarship data based on target countries.
    2.  **Pre-Filtering**: Applies hard constraints (Budget, Geography, GPA) before AI processing.
    3.  **Enhanced Analysis Agent**: OpenAI-powered agent acting as an "Educational Consultant" to generate recommendations.
    4.  **Validation Layer**: Automated checks for hallucinated data, placeholder text, or incorrect currency formats.
    5.  **Data Structuring**: Converts unstructured AI advice into clean, strictly typed JSON for the frontend.

-   **📄 Document Generation**:
    -   Auto-generates **Statement of Purpose (SOP)** outlines and tailored application checklists dynamically.

## 🛠️ Technology Stack

-   **Frontend Framework**: [React](https://react.dev/) (Hooks, Context, Custom Hooks)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom animations and glassmorphism effects.
-   **Animation**: [Framer Motion](https://www.framer.com/motion/) & [React Spring](https://www.react-spring.dev/).
-   **Icons**: [Lucide React](https://lucide.dev/).
-   **Internationalization**: [i18next](https://www.i18next.com/) & [react-i18next](https://react.i18next.com/).
-   **Utilities**: `jspdf` (PDF generation), `html2canvas` (Capture UI), `react-confetti`.

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   Node.js (v16 or higher)
-   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/azizjail2003/scholarship-finder.git
    cd scholarship-quest
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  **Open your browser**
    Navigate to `http://localhost:5173` to view the app.

## 📁 Project Structure

```
src/
├── locales/          # Translation files (en, fr, es, ar)
├── App.jsx           # Main application logic & state management
├── main.jsx          # Entry point
├── index.css         # Global styles & Tailwind directives
└── ...
```

## 🔮 Future Improvements

-   **Backend Integration**: Connect to a real database (Node.js/Express or Supabase) for user accounts and scholarship data.
-   **Real-time AI**: Integrate with OpenAI API for dynamic SOP generation and personalized advice.
-   **Social Features**: Allow users to share achievements and collaborate on applications.

---

Built with ❤️ by a passionate developer.
