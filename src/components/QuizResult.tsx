'use client';
import React from 'react';

interface QuizResultData {
  type: string;
  title: string;
  description: string;
  recommendations: string[];
}

interface QuizResultProps {
  result: QuizResultData;
  onResetQuiz: () => void;
  onViewProducts: () => void;
}

const QuizResult: React.FC<QuizResultProps> = ({
  result,
  onResetQuiz,
  onViewProducts
}) => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-medium text-black mb-8">
        SEU RESULTADO
      </h1>
      
      <div className="bg-gray-50 p-8 rounded-lg mb-8">
        <div className="mb-6">
          {/* Icon based on result type */}
          <div className="w-20 h-20 mx-auto mb-4 bg-black rounded-full flex items-center justify-center">
            {result.type === 'fresh' && (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
            {result.type === 'romantic' && (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
            {result.type === 'intense' && (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            )}
            {result.type === 'sport' && (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </div>
        </div>
        
        <h2 className="text-2xl font-medium text-black mb-4">
          {result.title}
        </h2>
        <p className="text-gray-700 mb-6 leading-relaxed max-w-2xl mx-auto">
          {result.description}
        </p>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium text-black mb-4">
            Recomendações para você:
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {result.recommendations.map((rec, index) => (
              <span 
                key={index}
                className="px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition-colors duration-200"
              >
                {rec}
              </span>
            ))}
          </div>
        </div>
        
        {/* Additional info based on type */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-black mb-2">Dica especial:</h4>
          <p className="text-sm text-gray-600">
            {result.type === 'fresh' && "Aplique em pontos de pulsação para uma fragrância duradoura e refrescante."}
            {result.type === 'romantic' && "Use em ocasiões especiais para criar uma aura envolvente e feminina."}
            {result.type === 'intense' && "Aplique com moderação - uma pequena quantidade é suficiente para causar impacto."}
            {result.type === 'sport' && "Ideal para o dia a dia e atividades físicas, proporcionando energia e frescor."}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onResetQuiz}
          className="px-8 py-3 border border-black text-black hover:bg-black hover:text-white transition-colors duration-200 rounded"
        >
          Refazer Quiz
        </button>
        <button
          onClick={onViewProducts}
          className="px-8 py-3 bg-black text-white hover:bg-gray-800 transition-colors duration-200 rounded"
        >
          Ver Produtos
        </button>
      </div>
    </div>
  );
};

export default QuizResult;