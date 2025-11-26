# Technical Architecture

## Overview
The application is a **Client-Side Single Page Application (SPA)** built with React. It relies on a "Stateless Backend" approach where the AI model (Gemini) manages the narrative state via structured prompts, while the React frontend manages the application state.

## Core Components

### 1. The State Machine (`App.tsx`)
The app operates in three distinct phases managed by `useState`:
*   `SELECTION`: User chooses a scenario.
*   `SIMULATION`: The active loop of Chat <-> AI.
*   `PROCTOR`: The evaluation phase, which contains a sub-state gate:
    1.  **Survey Gate:** User must complete `SurveyForm`.
    2.  **Report View:** User sees results and can download PDF.

### 2. AI Service Layer (`geminiService.ts`)
We do not use standard "Chat" sessions. Instead, we use a **Functional Request/Response** pattern to enforce game logic.

*   **Model:** `gemini-2.5-flash` (Optimized for speed/latency).
*   **Protocol:**
    *   Every request sends the full `history` + `systemInstruction`.
    *   **Crucial:** We enforce a `responseSchema` (JSON) to extract the `anger_level` integer programmatically.

**Data Structure (AI Output):**
```typescript
interface SimulationState {
  thought_process: string;   // Internal reasoning
  anger_level: number;       // 0-10
  spoken_response: string;   // What shows in the chat bubble
  instant_feedback: string;  // Short coaching tip for the student
  status: 'active' | 'failed' | 'resolved';
}
```

### 3. Component Hierarchy
```
App (Main Controller)
├── LearnReference (Overlay Component - Responsive)
├── Selection Screen (View)
├── Simulation Screen (Container)
│   ├── AngerMeter (Visual Component - Sticky Header)
│   ├── ChatList (Scrollable View)
│   │    └── CoachNote (Conditional Feedback Component)
│   └── InputArea (Form)
└── Proctor Screen (View)
    ├── SurveyForm (Gated Component)
    │    └── LikertScale / TextArea
    └── ReportView (Conditional Render)
         └── PDF Generator (Function via jspdf)
```

## Data Flow Diagram

1.  **User Input:** Student types "I am sorry about the wifi."
2.  **Frontend:** Appends message to local React state (`messages`).
3.  **API Call:** Sends `history` + `input` + `currentAngerLevel` to Gemini.
4.  **AI Processing:**
    *   Compares input against "Trigger Phrases".
    *   Evaluates against LEARN model.
    *   Generates `instant_feedback` tip.
    *   Calculates new `anger_level`.
5.  **JSON Return:** Gemini returns JSON object.
6.  **State Update:**
    *   `setAngerLevel(newLevel)` -> Triggers Animation.
    *   `setMessages(...)` -> Updates Chat UI with new Coach Note.
    *   `checkStatus(...)` -> If failed/resolved, switch Phase to `PROCTOR`.
7.  **Survey Gate:**
    *   App checks `surveyData` state.
    *   If null, renders `<SurveyForm />`.
    *   User Submit -> Triggers `mailto:` -> Sets `surveyData` -> Renders Report.

## Client-Side Reporting
*   **PDF Generation:** We use `jspdf` and `jspdf-autotable`.
*   **Logic:** The `ReportData` JSON returned by Gemini + `SurveyData` collected from the user are combined to create a multi-page PDF.
*   **Email:** Uses client-side `mailto:` generation to open the user's default email client with pre-filled survey data.

## Security & Stability
*   **Markdown Stripping:** A helper function `parseJSON` specifically strips markdown code fences to prevent JSON parse errors.
*   **Input Validation:** The UI prevents empty submissions.
*   **API Key:** Handled via `process.env.API_KEY` (Standard Google GenAI SDK practice).