# The Recovery Room: Hospitality Service Recovery Simulator

**The Recovery Room** is an AI-powered educational tool designed to help hospitality students practice the **LEARN model** (Listen, Empathize, Apologize, React, Notify) in a safe, simulated environment.

## 🎯 Concept
The application simulates a high-stakes service recovery scenario. The AI acts as an **"Irate Guest"** (Phase 1) and subsequently as a **"Proctor"** (Phase 2) to grade the student's performance.

## 🚀 Key Features

*   **Dual-Persona AI:**
    *   *Simulation Mode:* An emotional, irrational guest who shouts, interrupts, and demands solutions.
    *   *Proctor Mode:* A neutral instructor who generates a formal performance report.
*   **Real-time Anger Meter:** A visual indicator (0-10) driven by AI analysis of the student's tone and choices.
    *   **Green (0-3):** Safe/Resolved.
    *   **Yellow (4-7):** Warning/Annoyed.
    *   **Red (8-10):** Danger/Irate.
*   **💡 Instant Coaching:** The AI provides a short "Coach's Note" after every message, giving immediate feedback on the specific LEARN step used (or missed).
*   **📝 Interactive LEARN Reference:** A responsive cheat sheet available at all times (Side panel on desktop, Toggle on mobile).
*   **🧠 Metacognitive Impact Survey:** A mandatory self-reflection gateway.
    *   Includes 5 Likert-scale questions on critical thinking and autonomy.
    *   Includes 2 Open-ended questions for specific reflection and general feedback.
*   **📊 Professional Reporting:** 
    *   Detailed "Pass/Fail" audit for each step of the LEARN model.
    *   **PDF Export:** Students can download a branded, professional PDF report for their portfolio (includes survey answers).
*   **💾 Kiosk Mode & Data Export:**
    *   **Local Persistence:** All survey results are saved to the browser's local storage.
    *   **Instructor CSV Export:** Instructors can download a consolidated CSV file of all student attempts from the home screen.

## 🛠 Tech Stack

*   **Frontend:** React 19 (TypeScript)
*   **Styling:** Tailwind CSS (Custom animations for "Rage Mode")
*   **AI Engine:** Google Gemini API (`gemini-2.5-flash`)
*   **Data Validation:** Strict JSON Schema for state control
*   **Document Generation:** `jspdf` & `jspdf-autotable` (Client-side PDF creation)
*   **Deployment:** Docker / Google Cloud Run compatible

## 🏁 Scenarios

1.  **The Tech Failure:** WiFi down before a critical meeting.
2.  **The Privacy Breach:** Housekeeping ignored the "Do Not Disturb" sign.
3.  **The Financial Shock:** Double-charged credit card.
4.  **The Dining Disaster:** Dietary restriction violation.

## 🎮 How to Play

1.  Select a scenario from the main menu.
2.  The guest will start at **Anger Level 9**.
3.  Type your response using the **LEARN** technique.
4.  Watch the Anger Meter. If it hits 0-1, you win. If it stays at 10 too long, you fail.
5.  **Debrief:** Complete the mandatory Impact Survey to reflect on your strategy.
6.  **Review & Export:** Download your Official Simulation Report PDF at the end.
7.  **(Instructor Only):** Click "Export Data (CSV)" on the home screen to retrieve class results.