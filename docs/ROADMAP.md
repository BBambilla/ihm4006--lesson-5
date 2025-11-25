# Product Roadmap

## ✅ Phase 1: The MVP (Completed)
*   [x] **Core State Machine:** Implemented logic for Selection, Simulation, and Proctor phases.
*   [x] **Gemini Integration:** Connected `gemini-2.5-flash` with robust JSON schema validation.
*   [x] **Anger Meter UI:** Reactive progress bar that changes color/animates based on AI feedback.
*   [x] **Scenario Library:** Implemented the 4 core hospitality scenarios.
*   [x] **LEARN Reference:** Added a responsive "Cheat Sheet" overlay for students.
*   [x] **Real-time Feedback:** Implemented "Coach's Note" for instant tips after every turn.
*   [x] **Professional Reporting:** Structured table output with PDF Download capability.
*   [x] **Navigation:** Added "Change Scenario" back button functionality.

## 🚧 Phase 2: UX Refinements (Current Focus)
*   [ ] **Voice Input:** Allow students to speak their responses using the Web Speech API (Simulate real phone calls).
*   [ ] **Accessibility:** Improve ARIA labels for screen readers (specifically for the Anger Meter changes).
*   [ ] **Visual Avatars:** Add dynamic character portraits that change expression based on anger level.
*   [ ] **Scenario Randomizer:** A "Quick Play" button that picks a random scenario.

## 🔮 Phase 3: Advanced Features (Future)
*   **Teacher Dashboard:** A backend integration to save student reports for instructor review.
*   **Gemini Live Integration:** Upgrade from text-based chat to full low-latency audio streaming for a realistic "angry phone call" simulation.
*   **Custom Scenario Builder:** Allow instructors to upload their own scenarios via a text configuration.
*   **Leaderboard:** "Fastest De-escalation" times.
*   **Hint System:** An AI "Coach" that can whisper a hint if the student is stuck (costing simulation points).