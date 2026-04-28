'use client';
import React from 'react';

interface QuestionOption {
  id: string;
  text: string;
  value: string;
}

interface Question {
  id: number;
  question: string;
  options: QuestionOption[];
}

interface QuizQuestionProps {
  question: Question;
  currentQuestion: number;
  totalQuestions: number;
  onAnswer: (value: string) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  currentQuestion,
  totalQuestions,
  onAnswer
}) => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-medium text-black mb-8">
        DESCUBRA SEU PERFUME IDEAL
      </h1>
      <p className="text-gray-600 mb-12">
        Responda algumas perguntas e encontre a fragrância perfeita para você
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div 
          className="bg-black h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
        ></div>
      </div>

      {/* Question */}
      <div className="bg-gray-50 p-8 rounded-lg mb-8">
        <h2 className="text-xl font-medium text-black mb-6">
          {question.question}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onAnswer(option.value)}
              className="p-4 border border-gray-300 rounded-lg hover:border-black hover:bg-gray-100 transition-colors duration-200 text-left group"
            >
              <span className="font-medium text-black group-hover:text-black">
                {option.id.toUpperCase()})
              </span>
              <span className="ml-2 text-gray-700 group-hover:text-black">
                {option.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Pergunta {currentQuestion + 1} de {totalQuestions}
      </p>
    </div>
  );
};

export default QuizQuestion;