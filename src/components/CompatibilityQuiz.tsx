import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

const questions = [
  {
    id: 1,
    question: "How do you prefer to spend your weekends?",
    options: [
      { id: 'a', text: "Exploring nature and hiking", icon: "🌲" },
      { id: 'b', text: "Trying new restaurants and cafes", icon: "☕" },
      { id: 'c', text: "Relaxing at home with a good book", icon: "📚" },
      { id: 'd', text: "Attending social events and parties", icon: "🎉" }
    ]
  },
  {
    id: 2,
    question: "What's your primary love language?",
    options: [
      { id: 'a', text: "Words of Affirmation", icon: "💬" },
      { id: 'b', text: "Acts of Service", icon: "🛠️" },
      { id: 'c', text: "Receiving Gifts", icon: "🎁" },
      { id: 'd', text: "Quality Time", icon: "⏳" },
      { id: 'e', text: "Physical Touch", icon: "🤝" }
    ]
  },
  {
    id: 3,
    question: "How important is career ambition in a partner?",
    options: [
      { id: 'a', text: "Extremely important", icon: "🚀" },
      { id: 'b', text: "Somewhat important", icon: "📈" },
      { id: 'c', text: "Not a priority", icon: "🍃" }
    ]
  },
  {
    id: 4,
    question: "What's your ideal travel destination?",
    options: [
      { id: 'a', text: "A bustling city like Tokyo", icon: "🏙️" },
      { id: 'b', text: "A quiet beach in Bali", icon: "🏖️" },
      { id: 'c', text: "A historic tour through Europe", icon: "🏰" },
      { id: 'd', text: "An adventurous trek in Patagonia", icon: "🏔️" }
    ]
  }
];

const CompatibilityQuiz = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  const handleSelect = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [questions[currentStep].id]: optionId }));
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    } else {
      setIsFinished(true);
    }
  };

  const handleFinish = () => {
    // In a real app, we'd send this to the backend
    navigate('/dashboard');
  };

  if (isFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--gradient-bg)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[var(--card-bg)] p-10 rounded-3xl shadow-[var(--shadow-soft)] text-center border border-[var(--glass-border)]"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-green-500" size={40} />
          </div>
          <h2 className="text-3xl font-serif font-bold mb-4 text-[var(--text-main)]">Analysis Complete!</h2>
          <p className="text-[var(--text-muted)] mb-8">
            We've analyzed your clues and found several potential soulmates waiting for you.
          </p>
          <button 
            onClick={handleFinish}
            className="btn-cta w-full py-4 text-lg"
          >
            See My Matches
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--gradient-bg)]">
      <nav className="border-none bg-transparent">
        <div className="logo">HI<span>Clue</span></div>
        <div className="text-[var(--text-muted)] font-medium">
          Step {currentStep + 1} of {questions.length}
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full mb-12 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-[var(--accent-gradient)]"
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-4xl font-serif font-bold mb-10 text-[var(--text-main)] leading-tight">
                {currentQuestion.question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className={`
                      flex items-center p-6 rounded-2xl border-2 text-left transition-all duration-300
                      ${answers[currentQuestion.id] === option.id 
                        ? 'border-pink-400 bg-pink-50 dark:bg-pink-900/10' 
                        : 'border-[var(--glass-border)] bg-[var(--card-bg)] hover:border-pink-300'}
                    `}
                  >
                    <span className="text-3xl mr-4">{option.icon}</span>
                    <span className="text-lg font-medium text-[var(--text-main)]">{option.text}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="flex items-center text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={20} className="mr-1" /> Back
            </button>
            
            {currentStep < questions.length - 1 && (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!answers[currentQuestion.id]}
                className="flex items-center text-pink-400 font-semibold disabled:opacity-30"
              >
                Skip <ChevronRight size={20} className="ml-1" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityQuiz;
