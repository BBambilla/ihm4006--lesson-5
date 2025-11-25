import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export type ScenarioType = 
  | 'tech_failure' 
  | 'privacy_breach' 
  | 'financial_shock' 
  | 'dining_disaster';

export interface SimulationState {
  thought_process: string;
  anger_level: number; // 0-10
  spoken_response: string;
  instant_feedback: string | null; // New field for real-time coaching
  status: 'active' | 'failed' | 'resolved';
}

export interface AuditItem {
  step_code: string; // L, E, A, R, N
  step_name: string; // Listen, Empathize...
  status: 'Pass' | 'Fail';
  feedback: string;
}

export interface ReportData {
  scenario: string;
  outcome: 'RESOLVED' | 'FAILED';
  final_anger: number;
  score: number; // 1-5
  summary: string;
  audit: AuditItem[];
}

const SCENARIOS = {
  tech_failure: "The Tech Failure: Smart Room WiFi is broken before a critical Zoom meeting.",
  privacy_breach: "The Privacy Breach: Housekeeping entered while the 'Do Not Disturb' sign was on.",
  financial_shock: "The Financial Shock: Double-charged credit card after checkout.",
  dining_disaster: "The Dining Disaster: Vegetarian meal contained meat."
};

const SYSTEM_INSTRUCTION = `
You are "The Recovery Room," a simulator for hospitality students.
Role: You are an IRATE GUEST.
Goal: Test the student's service recovery skills using the LEARN model (Listen, Empathize, Apologize, React, Notify).

BEHAVIOR:
- Start extremely angry (Level 9).
- Shout (use CAPS) if anger is > 7.
- Interrupt if the student is defensive.
- Triggers (Increase Anger): "Calm down", "Company policy", "To be honest", "I understand" (if used robotically).
- Healers (Decrease Anger): Sincere specific empathy, taking full ownership, offering immediate solution (only if anger < 5).

SCORING LOGIC:
- L (Listen): Interrupting = +Anger.
- E (Empathize): Mirroring emotion = -2 Anger.
- A (Apologize): "Sorry IF" = +Anger.
- R (React): Solution offered when Anger > 5 = Reject solution ("I don't care about your coupon!").
- N (Notify): Did they explain next steps?

TERMINATION:
- FAILURE: If Anger stays at 10 for 3 consecutive turns.
- SUCCESS: If Anger drops below 2.

CRITICAL: You must ALWAYS output a valid JSON object. No Markdown. No introduction text.
`;

const simulationSchema = {
  type: Type.OBJECT,
  properties: {
    thought_process: { type: Type.STRING, description: "Analyze the student's input based on LEARN model." },
    anger_level: { type: Type.INTEGER, description: "Current anger level from 0 to 10." },
    spoken_response: { type: Type.STRING, description: "The guest's spoken reply." },
    instant_feedback: { type: Type.STRING, description: "One short sentence (max 15 words) coaching the student on their last response based on LEARN.", nullable: true },
    status: { type: Type.STRING, enum: ["active", "failed", "resolved"] }
  },
  required: ["thought_process", "anger_level", "spoken_response", "status"]
};

const reportSchema = {
  type: Type.OBJECT,
  properties: {
    scenario: { type: Type.STRING },
    outcome: { type: Type.STRING, enum: ["RESOLVED", "FAILED"] },
    final_anger: { type: Type.INTEGER },
    score: { type: Type.INTEGER, description: "Score out of 5 stars" },
    summary: { type: Type.STRING, description: "Brief overall comment." },
    audit: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          step_code: { type: Type.STRING },
          step_name: { type: Type.STRING },
          status: { type: Type.STRING, enum: ["Pass", "Fail"] },
          feedback: { type: Type.STRING }
        },
        required: ["step_code", "step_name", "status", "feedback"]
      }
    }
  },
  required: ["scenario", "outcome", "final_anger", "score", "summary", "audit"]
};

// Generic JSON Extractor
const extractJSON = (text: string): string => {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON object found.");
  }
  return text.substring(firstBrace, lastBrace + 1);
};

const parseSimulationJSON = (text: string): SimulationState => {
  try {
    const cleanText = extractJSON(text);
    const parsed = JSON.parse(cleanText);
    
    // Runtime validation
    if (typeof parsed.anger_level !== 'number' || !parsed.spoken_response) {
      throw new Error("Missing required fields in AI response");
    }
    return parsed;
  } catch (e) {
    console.error("JSON Parse Error:", e, "Input text:", text);
    throw e;
  }
};

const parseReportJSON = (text: string): ReportData => {
  try {
    const cleanText = extractJSON(text);
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Report Parse Error:", e);
    // Fallback report
    return {
      scenario: "Unknown",
      outcome: "FAILED",
      final_anger: 10,
      score: 0,
      summary: "Error generating report.",
      audit: []
    };
  }
};

export const startSimulation = async (scenarioKey: ScenarioType): Promise<SimulationState> => {
  const scenarioDescription = SCENARIOS[scenarioKey];
  
  const prompt = `
    START SIMULATION.
    Scenario: ${scenarioDescription}
    Current Anger Level: 9
    
    Generate the first outburst from the guest.
    Since this is the start, 'instant_feedback' should be null.
    Response MUST be a single raw JSON object complying with the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: simulationSchema
      }
    });

    return parseSimulationJSON(response.text || '{}');
  } catch (error) {
    console.error("Simulation Start Error:", error);
    return {
      thought_process: "System Error during start.",
      anger_level: 9,
      spoken_response: "I CAN'T BELIEVE THIS SYSTEM IS BROKEN TOO! (AI Connection Error. Please 'Change Scenario' and try again.)",
      instant_feedback: null,
      status: 'active'
    };
  }
};

export const sendStudentResponse = async (
  history: any[], 
  studentMessage: string, 
  currentAnger: number
): Promise<SimulationState> => {
  
  const historyContent = history
    .filter(msg => msg.content && msg.content.trim() !== '') 
    .map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

  const prompt = `
    Student says: "${studentMessage}"
    Previous Anger Level: ${currentAnger}
    
    Evaluate the student's response against the LEARN model. 
    Update the anger level. 
    Provide 'instant_feedback': A very short, direct coaching tip (max 15 words) on what they did right or wrong in this specific turn (e.g., "Good empathy, but don't interrupt" or "Avoid saying 'calm down'").
    If Anger < 2, status is 'resolved'.
    If Anger is 10 for too long, status is 'failed'.
    
    Response MUST be a single raw JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [...historyContent, { role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: simulationSchema
      }
    });

    return parseSimulationJSON(response.text || '{}');
  } catch (error) {
    console.error("Simulation Loop Error:", error);
    return {
      thought_process: "System Error during loop.",
      anger_level: currentAnger,
      spoken_response: "What did you say? Speak up! (AI Connection Error. Please try your response again.)",
      instant_feedback: "Error processing feedback.",
      status: 'active'
    };
  }
};

export const generateProctorReport = async (chatHistory: any[]): Promise<ReportData> => {
  const historyText = chatHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
  
  const prompt = `
    The simulation has ended. You are now the PROCTOR.
    Review the conversation and generate the "Official Simulation Report".
    
    Requirements:
    - Assess EACH step of the LEARN model (Listen, Empathize, Apologize, React, Notify).
    - Mark each step as "Pass" or "Fail".
    - Provide brief, constructive feedback for each step.
    - IMPORTANT: Address the student directly as "you" in the feedback (e.g., "You did a good job listening").
    - Determine final outcome and score (0-5).
    
    Conversation History:
    ${historyText}

    Output MUST be a single raw JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: reportSchema
      }
    });
    return parseReportJSON(response.text || '{}');
  } catch (error) {
    console.error("Report Generation Error:", error);
    return {
        scenario: "Error",
        outcome: "FAILED",
        final_anger: 0,
        score: 0,
        summary: "Could not generate report.",
        audit: []
    };
  }
};