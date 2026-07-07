import React from 'react';

export const EducationalAI: React.FC = () => {
  return (
    <div className="fixed top-16 md:top-20 bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-0 left-0 right-0 z-40 bg-white">
      <iframe 
        src="https://3alem-o-t3alem-ia.vercel.app/" 
        className="w-full h-full border-0"
        title="Assistant IA 3alem o t3alem"
        allow="clipboard-read; clipboard-write; microphone; camera"
      />
    </div>
  );
};
