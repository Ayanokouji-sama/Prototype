import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { submitQuestionnaire } from '../services/api';
import { ReactComponent as MyLogo } from '../assets/my-logo.svg'; 

const Questionnaire = ({ onComplete }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // UPDATED: The questionnaire is now shorter as requested.
  const questions = [
    { id: 'status', question: 'To start, what is your current status?', type: 'select', options: [
        { value: 'school_student', label: 'School Student' }, { value: 'college_student', label: 'College Student' }, { value: 'passout', label: 'Professional/Passout' }
    ]},
    { id: 'name', question: 'Great. What is your name?', type: 'text', placeholder: 'e.g., Alex Doe' },
    { id: 'age', question: 'And what is your age?', type: 'number', placeholder: 'e.g., 16' },
  ];

  const currentQuestion = questions[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;
  const currentValue = formData[currentQuestion?.id];

  const handleOptionSelect = (value) => {
    setError('');
    setFormData({ ...formData, [currentQuestion.id]: value });
  };

  const handleNext = () => {
    // Basic validation before proceeding
    if (!currentValue) {
        setError('Please provide an answer.');
        return;
    }
    if (currentQuestion.id === 'name' && currentValue.length < 2) {
        setError('Name must be at least 2 characters.');
        return;
    }
     if (currentQuestion.id === 'age' && (parseInt(currentValue) < 10 || parseInt(currentValue) > 100)) {
        setError('Please enter a valid age.');
        return;
    }
    
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setError('');
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const response = await submitQuestionnaire(formData);
      if (response.success) {
        onComplete(response);
      } else {
        const errorMessages = Object.values(response.errors || {'general': ['An unknown error occurred.']}).join('\n');
        setError(errorMessages);
      }
    } catch (error) {
      setError('An error occurred. Please ensure your backend server is running and accessible.');
    } finally {
      setIsSubmitting(false);
    }
  };

return (
    <div 
  className="h-screen w-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 text-white relative overflow-hidden">
        {/* Header with Logo */}
<div className="absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5">
    <MyLogo className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
    
    <span className="text-lg sm:text-2xl md:text-3xl lg:text-4xl opacity-70 font-glory font-extralight">
        <span className="block sm:hidden">VT</span>
        <span className="hidden sm:block md:hidden">Vision Track</span>
        <span className="hidden md:block">Vision Track</span>
    </span>
</div>
      
        {/* Glassmorphism Card */}
<div className="bg-white bg-opacity-5 backdrop-blur-md border border-white/50 rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 md:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col">
    
    <h2 className="text-base sm:text-lg md:text-xl font-light text-center mb-4 sm:mb-6 mt-3 sm:mt-4 md:mt-6 px-2">
    {currentQuestion.question}
    </h2>

    {/* Divider line */}
    <div className="w-32 sm:w-36 md:w-44 h-px bg-white opacity-50 my-2 sm:my-3 mb-4 sm:mb-6 md:mb-8 mx-auto"></div>
    
    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 md:mb-8 min-h-[90px] sm:min-h-[120px]">
    {currentQuestion.type === 'select' && currentQuestion.options.map(option => (
        <button 
            key={option.value} 
            onClick={() => handleOptionSelect(option.value)} 
            className={`w-full p-2 sm:p-3 text-left rounded-md sm:rounded-lg transition-all flex justify-between items-center border border-transparent ${currentValue === option.value ? 'bg-white/10' : 'hover:bg-white/10'}`}
        >
            <span className="font-extralight text-sm sm:text-base font-roboto-flex opacity-90 pr-2">
                {option.label}
            </span>
            {/* Show checkmark if selected */}
            {currentValue === option.value && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />}
        </button>
    ))}

    {currentQuestion.type === 'text' && (
        <input 
            type="text" 
            placeholder={currentQuestion.placeholder} 
            value={currentValue || ''} 
            onChange={(e) => handleOptionSelect(e.target.value)} 
            className="w-full p-2 sm:p-3 bg-transparent border-b-2 border-white/30 text-white text-base sm:text-lg text-center placeholder:text-white/50 focus:outline-none focus:border-white transition-colors"
        />
    )}

    {currentQuestion.type === 'number' && (
        <input 
            type="number" 
            placeholder={currentQuestion.placeholder} 
            value={currentValue || ''} 
            onChange={(e) => handleOptionSelect(e.target.value)} 
            className="w-full p-2 sm:p-3 bg-transparent border-b-2 border-white/30 text-white text-base sm:text-lg text-center placeholder:text-white/50 focus:outline-none focus:border-white transition-colors"
        />
    )}
</div>

    {/* Bottom divider line - ADJUSTED */}
    <div className="w-32 sm:w-36 md:w-44 h-px bg-white opacity-50 my-2 sm:my-3 mx-auto"></div>

    {/* Styled Error Message - ADJUSTED */}
    {error && (
        <div className="bg-red-500/20 border border-red-500 text-white p-2 sm:p-3 mb-3 sm:mb-4 rounded-md sm:rounded-lg text-center text-xs sm:text-sm">
            <p>{error}</p>
        </div>
    )}
    
    {/* New Navigation and Progress Area - ADJUSTED */}
    <div className="flex justify-between items-center mt-auto pt-2">
        <button 
            onClick={handleBack} 
            disabled={questionIndex === 0 || isSubmitting} 
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/10 border border-white/20 rounded-full disabled:opacity-30 hover:bg-white/20 transition-colors"
        >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        <div className="flex flex-col items-center px-2">
            <div className="w-24 sm:w-32 md:w-44 bg-white/20 rounded-full h-1">
                <div className="bg-white h-1 rounded-full transition-all duration-300" style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}></div>
            </div>
            <span className="text-white/80 font-light mt-1 sm:mt-2 text-xs sm:text-sm text-center whitespace-nowrap">
                Question {questionIndex + 1} of {questions.length}
            </span>
        </div>
        
        <button 
            onClick={handleNext} 
            disabled={isSubmitting} 
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/10 border border-white/20 rounded-full disabled:opacity-30 hover:bg-white/20 transition-colors"
        >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
    </div>
</div>
    </div>
  );
};

export default Questionnaire;

