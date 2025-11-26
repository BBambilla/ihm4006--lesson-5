import React, { useState, useEffect, useRef } from 'react';
import AngerMeter from './AngerMeter';
import LearnReference from './LearnReference';
import SurveyForm, { SurveyData, QUESTIONS } from './SurveyForm';
import { startSimulation, sendStudentResponse, generateProctorReport, ScenarioType, SimulationState, ReportData } from './geminiService';

// Declaration for the global jsPDF object added via CDN
declare global {
  interface Window {
    jspdf: any;
  }
}

type Phase = 'SELECTION' | 'SIMULATION' | 'PROCTOR';

interface Message {
  role: 'model' | 'user' | 'system';
  content: string;
  thoughtProcess?: string;
  feedback?: string | null; // Added feedback field
}

const App: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('SELECTION');
  const [scenario, setScenario] = useState<ScenarioType | null>(null);
  const [angerLevel, setAngerLevel] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleStart = async (selectedScenario: ScenarioType) => {
    setLoading(true);
    setScenario(selectedScenario);
    setPhase('SIMULATION');
    setMessages([]);
    setSurveyData(null); // Reset survey for new game
    
    // Initial call to AI
    const state = await startSimulation(selectedScenario);
    
    setAngerLevel(state.anger_level);
    setMessages([{ 
      role: 'model', 
      content: state.spoken_response, 
      thoughtProcess: state.thought_process 
    }]);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const studentMessage = input;
    setInput('');
    setLoading(true);
    
    // UI Update: Show student message immediately
    const newHistory: Message[] = [...messages, { role: 'user', content: studentMessage }];
    setMessages(newHistory);

    const state = await sendStudentResponse(messages, studentMessage, angerLevel);
    
    setAngerLevel(state.anger_level);
    const aiMessage: Message = {
      role: 'model',
      content: state.spoken_response,
      thoughtProcess: state.thought_process,
      feedback: state.instant_feedback // Capture feedback
    };
    
    setMessages(prev => [...prev, aiMessage]);
    setLoading(false);

    // Check for end conditions
    if (state.status !== 'active') {
       handleSimulationEnd(state.status, [...newHistory, aiMessage]);
    }
  };

  const handleSimulationEnd = async (outcome: string, finalHistory: Message[]) => {
    setPhase('PROCTOR');
    setLoading(true);
    const reportData = await generateProctorReport(finalHistory);
    setReport(reportData);
    setLoading(false);
  };

  const resetApp = () => {
    setPhase('SELECTION');
    setScenario(null);
    setAngerLevel(0);
    setMessages([]);
    setReport(null);
    setInput('');
    setSurveyData(null);
  };

  const sendSurveyToInstructor = (data: SurveyData) => {
    const subject = "Recovery Room Survey Completion";
    const body = `
Student Survey Responses:
-------------------------
1. Strategic Thinking: ${data.q1}/5
2. Epistemic Vigilance: ${data.q2}/5
3. Intellectual Autonomy: ${data.q3}/5
4. Perceived Usefulness: ${data.q4}/5
5. Perceived Ease of Use: ${data.q5}/5

REFLECTION:
${data.q6}
    `.trim();
    
    // Construct mailto link
    // Note: window.location.href is standard for triggering mail clients without opening a blank tab
    window.location.href = `mailto:bbambilla@arden.ac.uk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSurveySubmit = (data: SurveyData) => {
    sendSurveyToInstructor(data);
    setSurveyData(data);
  };

  const downloadPDF = () => {
    if (!report) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // 1. Header
    doc.setFillColor(17, 24, 39); // Gray 900
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("The Recovery Room", 14, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(16, 185, 129); // Emerald 500
    doc.text("OFFICIAL SIMULATION REPORT", 14, 28);
    
    // 2. Metadata
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 50);
    doc.text(`Scenario: ${report.scenario}`, 14, 56);
    
    const outcomeColor = report.outcome === 'RESOLVED' ? [16, 185, 129] : [220, 38, 38];
    doc.setTextColor(outcomeColor[0], outcomeColor[1], outcomeColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`Outcome: ${report.outcome}`, 14, 62);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Final Score: ${report.score}/5 Stars`, 14, 68);

    // 3. Summary
    doc.setFont("helvetica", "italic");
    doc.setTextColor(80, 80, 80);
    const summaryLines = doc.splitTextToSize(`Instructor Summary: ${report.summary}`, 180);
    doc.text(summaryLines, 14, 80);

    // 4. Audit Table
    const tableBody = report.audit.map(item => [
      item.step_code,
      item.step_name,
      item.status,
      item.feedback
    ]);

    (doc as any).autoTable({
      startY: 95,
      head: [['Step', 'Criteria', 'Status', 'Feedback']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold', cellWidth: 15 },
        1: { fontStyle: 'bold', cellWidth: 30 },
        2: { halign: 'center', fontStyle: 'bold', cellWidth: 25 },
        3: { cellWidth: 'auto' } // Feedback column takes remaining width
      },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 2) {
          if (data.cell.raw === 'Pass') {
            data.cell.styles.textColor = [16, 185, 129];
          } else {
            data.cell.styles.textColor = [220, 38, 38];
          }
        }
      }
    });

    // 5. Survey Results (Self-Reflection Audit)
    if (surveyData) {
      doc.addPage();
      
      doc.setFillColor(17, 24, 39); 
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Self-Reflection Audit (Meta-TAM)", 14, 20);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      
      let yPos = 45;
      
      const printQuestionScore = (qText: string, score: number) => {
        doc.setFont("helvetica", "bold");
        const lines = doc.splitTextToSize(qText, 170);
        doc.text(lines, 14, yPos);
        yPos += (lines.length * 5) + 2;
        
        doc.setFont("helvetica", "normal");
        doc.text(`Student Rating: ${score}/5`, 14, yPos);
        yPos += 10;
      };

      printQuestionScore(`1. Strategic Thinking: ${QUESTIONS.q1}`, surveyData.q1);
      printQuestionScore(`2. Epistemic Vigilance: ${QUESTIONS.q2}`, surveyData.q2);
      printQuestionScore(`3. Intellectual Autonomy: ${QUESTIONS.q3}`, surveyData.q3);
      printQuestionScore(`4. Perceived Usefulness: ${QUESTIONS.q4}`, surveyData.q4);
      printQuestionScore(`5. Perceived Ease of Use: ${QUESTIONS.q5}`, surveyData.q5);

      yPos += 5;
      doc.setFont("helvetica", "bold");
      doc.text("6. Reflection on AI Advice:", 14, yPos);
      yPos += 7;
      doc.setFont("helvetica", "italic");
      doc.setTextColor(60, 60, 60);
      const reflectionLines = doc.splitTextToSize(surveyData.q6, 180);
      doc.text(reflectionLines, 14, yPos);
    }

    // 6. Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated by The Recovery Room - Hospitality Service Simulator", 14, pageHeight - 10);

    doc.save(`RecoveryRoom_Report_${new Date().getTime()}.pdf`);
  };

  // --- RENDERERS ---

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-200 relative">
      
      {/* GLOBAL LEARN REFERENCE OVERLAY */}
      <LearnReference />

      {phase === 'SELECTION' ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-900 text-gray-100">
          <div className="max-w-2xl w-full text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 tracking-tight text-emerald-400">THE RECOVERY ROOM</h1>
            <p className="text-gray-400 text-lg">Hospitality Service Recovery Simulator (LEARN Model)</p>
            <div className="mt-8 border-t border-gray-800 pt-8">
              <p className="mb-6 font-mono text-sm uppercase text-gray-500">Select a Scenario to Begin</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'tech_failure', title: 'The Tech Failure', desc: 'WiFi broken before critical meeting' },
                  { id: 'privacy_breach', title: 'The Privacy Breach', desc: 'Housekeeping ignored DND sign' },
                  { id: 'financial_shock', title: 'The Financial Shock', desc: 'Double charged after checkout' },
                  { id: 'dining_disaster', title: 'The Dining Disaster', desc: 'Meat found in vegetarian meal' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStart(s.id as ScenarioType)}
                    className="p-6 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-left transition-all hover:scale-[1.02] hover:border-emerald-500 group"
                  >
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400">{s.title}</h3>
                    <p className="text-sm text-gray-400 mt-2">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 1. Header & Anger Meter */}
          {phase === 'SIMULATION' && <AngerMeter level={angerLevel} onBack={resetApp} />}
          {phase === 'PROCTOR' && <AngerMeter level={angerLevel} />} {/* Hide back button in proctor mode */}

          {/* 2. Chat Area (Hidden in Proctor Mode until Survey Done if desired, but here we replace it) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32">
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* Only show messages in SIMULATION phase */}
              {phase === 'SIMULATION' && messages.map((m, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[85%] rounded-2xl p-5 ${
                        m.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-sm' 
                          : 'bg-gray-800 border border-gray-700 text-gray-100 rounded-tl-sm shadow-sm'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                  
                  {/* COACH TIP */}
                  {m.feedback && (
                    <div className="flex justify-center my-2 animate-[fadeIn_0.5s_ease-out]">
                      <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg p-2 px-4 flex items-center gap-2 max-w-lg">
                        <span className="text-lg">💡</span>
                        <span className="text-emerald-400 text-xs font-mono font-bold tracking-tight uppercase">Coach:</span>
                        <span className="text-emerald-200 text-sm italic">{m.feedback}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && phase === 'SIMULATION' && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-gray-800 rounded-2xl p-4 text-gray-400 text-sm font-mono">
                    Guest is reacting...
                  </div>
                </div>
              )}

              {/* PROCTOR PHASE: Survey OR Report */}
              {phase === 'PROCTOR' && (
                <div className="mt-6 mb-12">
                    
                    {loading && (
                      <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
                        <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-300 font-mono">Auditing your performance...</p>
                      </div>
                    )}

                    {!loading && !report && (
                       <div className="text-center text-red-500">Error loading report. Please try again.</div>
                    )}

                    {/* Step 1: Survey (If report exists but survey not done) */}
                    {!loading && report && !surveyData && (
                      <SurveyForm onSubmit={handleSurveySubmit} />
                    )}

                    {/* Step 2: Final Report (Only after survey is done) */}
                    {!loading && report && surveyData && (
                      <div className="bg-white text-gray-900 rounded-xl overflow-hidden shadow-2xl animate-[fadeIn_0.5s_ease-out]">
                        
                        {/* Header */}
                        <div className={`p-8 text-center ${report.outcome === 'RESOLVED' ? 'bg-emerald-100' : 'bg-red-100'} border-b border-gray-200`}>
                          <h3 className={`text-3xl font-black uppercase tracking-tight mb-2 ${report.outcome === 'RESOLVED' ? 'text-emerald-800' : 'text-red-800'}`}>
                            {report.outcome}
                          </h3>
                          <div className="flex justify-center gap-1 text-2xl mb-2">
                             {[...Array(5)].map((_, i) => (
                               <span key={i} className={i < report.score ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                             ))}
                          </div>
                          <p className="text-gray-600 font-medium">{report.summary}</p>
                        </div>

                        {/* Audit Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-bold text-gray-500 tracking-wider">
                                <th className="p-4 w-16 text-center">Step</th>
                                <th className="p-4 w-32">Criteria</th>
                                <th className="p-4 w-24 text-center">Status</th>
                                <th className="p-4">Feedback</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {report.audit.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="p-4 text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white font-bold font-mono text-sm">
                                      {item.step_code}
                                    </span>
                                  </td>
                                  <td className="p-4 font-bold text-gray-800">{item.step_name}</td>
                                  <td className="p-4 text-center">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                      item.status === 'Pass' 
                                        ? 'bg-emerald-100 text-emerald-700' 
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                      {item.status}
                                    </span>
                                  </td>
                                  <td className="p-4 text-sm text-gray-600 leading-relaxed">
                                    {item.feedback}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row justify-center gap-4">
                          <button 
                            onClick={downloadPDF}
                            className="px-6 py-3 bg-white text-gray-800 border border-gray-300 font-bold rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md transition-all flex items-center justify-center gap-2"
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                             Download PDF
                          </button>
                          <button 
                            onClick={resetApp}
                            className="px-8 py-3 bg-gray-900 text-white font-bold rounded-lg shadow-lg hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                          >
                            Try Another Scenario
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 3. Input Area */}
          {phase === 'SIMULATION' && (
            <div className="fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-800 p-4">
              <div className="max-w-3xl mx-auto relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your response... (Remember the LEARN model)"
                  disabled={loading}
                  className="w-full bg-gray-950 text-white rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-gray-700 disabled:opacity-50"
                  autoFocus
                />
                <button 
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-2 p-2 bg-emerald-600 rounded-full hover:bg-emerald-500 disabled:bg-gray-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;