import React, { useState } from 'react';

const LearnReference: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const Content = () => (
    <div>
      <h3 className="text-emerald-400 font-bold mb-4 border-b border-gray-700 pb-2 tracking-widest text-sm uppercase">
        The LEARN Model
      </h3>
      <ul className="space-y-4 font-mono text-sm">
        <li className="flex flex-col group">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-500 group-hover:text-emerald-400 transition-colors">L</span>
            <span className="font-bold text-gray-200">Listen</span>
          </div>
          <span className="text-xs text-gray-500 pl-8 leading-tight">Let them vent. Do not interrupt. Focus on their words.</span>
        </li>
        <li className="flex flex-col group">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-500 group-hover:text-emerald-400 transition-colors">E</span>
            <span className="font-bold text-gray-200">Empathize</span>
          </div>
          <span className="text-xs text-gray-500 pl-8 leading-tight">Validate their emotion. "I can see why you are upset."</span>
        </li>
        <li className="flex flex-col group">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-500 group-hover:text-emerald-400 transition-colors">A</span>
            <span className="font-bold text-gray-200">Apologize</span>
          </div>
          <span className="text-xs text-gray-500 pl-8 leading-tight">Sincere apology. Avoid "I'm sorry IF..." or excuses.</span>
        </li>
        <li className="flex flex-col group">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-500 group-hover:text-emerald-400 transition-colors">R</span>
            <span className="font-bold text-gray-200">React</span>
          </div>
          <span className="text-xs text-gray-500 pl-8 leading-tight">Resolve the issue. Only offer solutions when anger &lt; 5.</span>
        </li>
        <li className="flex flex-col group">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-500 group-hover:text-emerald-400 transition-colors">N</span>
            <span className="font-bold text-gray-200">Notify</span>
          </div>
          <span className="text-xs text-gray-500 pl-8 leading-tight">Explain next steps. Follow up. Close the loop.</span>
        </li>
      </ul>
    </div>
  );

  return (
    <>
      {/* Desktop View: Always visible side card */}
      <div className="hidden xl:block fixed top-1/2 -translate-y-1/2 right-8 z-10 w-72 bg-gray-900/90 backdrop-blur border border-gray-700 p-6 rounded-2xl shadow-2xl">
        <Content />
      </div>

      {/* Mobile/Tablet View: Toggle Button */}
      <div className="xl:hidden fixed bottom-24 right-4 z-40">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gray-800 text-emerald-400 border border-emerald-500/30 w-12 h-12 rounded-full shadow-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
          title="Show LEARN Model"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
          ) : (
            <span className="font-bold text-[10px] tracking-tighter">LEARN</span>
          )}
        </button>
      </div>

      {/* Mobile Modal/Popup */}
      {isOpen && (
        <div className="xl:hidden fixed bottom-40 right-4 z-40 w-72 bg-gray-900 border border-emerald-500/50 p-6 rounded-xl shadow-2xl animate-[fadeInUp_0.3s_ease-out]">
           <Content />
        </div>
      )}
    </>
  );
};

export default LearnReference;