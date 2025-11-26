import React, { useState } from 'react';

export interface SurveyData {
  q1: number; // Strategic Thinking
  q2: number; // Epistemic Vigilance
  q3: number; // Intellectual Autonomy
  q4: number; // Perceived Usefulness
  q5: number; // Perceived Ease of Use
  q6: string; // Open-ended reflection
}

interface SurveyFormProps {
  onSubmit: (data: SurveyData) => void;
}

export const QUESTIONS = {
  q1: "Before typing my responses, I consciously planned my strategy using the LEARN model steps.",
  q2: "I critically evaluated the Coach's Notes for accuracy and realism before deciding whether to apply the advice.",
  q3: "I felt I was using my own professional judgment to solve the problem, rather than just doing whatever the AI wanted me to do to 'win'.",
  q4: "This simulation helped me understand how to apply service recovery techniques better than a standard lecture.",
  q5: "The interface (Anger Meter, Chat) was intuitive and allowed me to focus on learning."
};

const SurveyForm: React.FC<SurveyFormProps> = ({ onSubmit }) => {
  const [data, setData] = useState<SurveyData>({
    q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: ''
  });

  const isValid = Object.values(data).every(val => val !== 0 && val !== '');

  const handleLikertChange = (key: keyof SurveyData, value: number) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        
        <div className="bg-gray-900 p-8 border-b border-gray-700 text-center">
          <h2 className="text-2xl font-bold text-emerald-400 mb-2">Simulation Debrief</h2>
          <p className="text-gray-400">Please complete this short reflection to unlock your final report.</p>
        </div>

        <div className="p-8 space-y-8">
          
          {/* Likert Scale Questions */}
          {Object.entries(QUESTIONS).map(([key, question]) => (
            <div key={key} className="space-y-3">
              <p className="text-gray-200 font-medium text-lg">{question}</p>
              <div className="flex flex-wrap gap-2 sm:gap-4 justify-between bg-gray-900/50 p-4 rounded-lg">
                {[1, 2, 3, 4, 5].map((num) => (
                  <label key={num} className="flex flex-col items-center cursor-pointer group">
                    <input 
                      type="radio" 
                      name={key} 
                      value={num} 
                      checked={data[key as keyof SurveyData] === num}
                      onChange={() => handleLikertChange(key as keyof SurveyData, num)}
                      className="hidden" 
                    />
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border-2 transition-all font-bold text-lg
                      ${data[key as keyof SurveyData] === num 
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-110' 
                        : 'border-gray-600 text-gray-500 hover:border-gray-400 hover:text-gray-300'
                      }`}
                    >
                      {num}
                    </div>
                    <span className="text-[10px] uppercase mt-2 text-gray-500 font-mono">
                      {num === 1 ? 'Disagree' : num === 5 ? 'Agree' : ''}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Open Ended Question */}
          <div className="space-y-3">
            <label className="text-gray-200 font-medium text-lg">
              Describe a specific moment where you chose to ignore or modify the AI's advice because you felt your own judgment was better.
            </label>
            <textarea 
              value={data.q6}
              onChange={(e) => setData(prev => ({ ...prev, q6: e.target.value }))}
              placeholder="I chose to ignore the coach when..."
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[120px]"
            />
          </div>

        </div>

        <div className="p-6 bg-gray-900 border-t border-gray-700 flex justify-end">
          <button 
            onClick={() => onSubmit(data)}
            disabled={!isValid}
            className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-lg shadow-lg hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
          >
            Submit & Generate Report
          </button>
        </div>

      </div>
    </div>
  );
};

export default SurveyForm;
