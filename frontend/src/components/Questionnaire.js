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
  className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 text-white relative"
  style={{ backgroundImage: 'url(/questionnarie-bg.png)' }}
    >
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
<div className="bg-green-200/20 backdrop-blur-lg border border-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg flex flex-col">
    
    <h2 className="text-lg sm:text-xl md:text-2xl font-light text-center mb-6 sm:mb-8 mt-4 sm:mt-6 md:mt-8 px-2">
        {currentQuestion.question}
    </h2>

    {/* Divider line */}
    <div className="w-40 sm:w-48 md:w-60 h-px bg-white opacity-50 my-3 sm:my-4 mb-6 sm:mb-8 md:mb-12 mx-auto"></div>
    
    <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 md:mb-10 min-h-[120px] sm:min-h-[150px]">
        {currentQuestion.type === 'select' && currentQuestion.options.map(option => (
            <button 
                key={option.value} 
                onClick={() => handleOptionSelect(option.value)} 
                className={`w-full p-3 sm:p-4 text-left rounded-lg sm:rounded-xl transition-all flex justify-between items-center border border-transparent ${currentValue === option.value ? 'bg-white/10' : 'hover:bg-white/10'}`}
            >
                <span className="font-extralight text-base sm:text-lg font-roboto-flex opacity-90 pr-2">
                    {option.label}
                </span>
                {/* Show checkmark if selected */}
                {currentValue === option.value && <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />}
            </button>
        ))}

        {currentQuestion.type === 'text' && (
            <input 
                type="text" 
                placeholder={currentQuestion.placeholder} 
                value={currentValue || ''} 
                onChange={(e) => handleOptionSelect(e.target.value)} 
                className="w-full p-3 sm:p-4 bg-transparent border-b-2 border-white/30 text-white text-lg sm:text-xl text-center placeholder:text-white/50 focus:outline-none focus:border-white transition-colors"
            />
        )}

        {currentQuestion.type === 'number' && (
            <input 
                type="number" 
                placeholder={currentQuestion.placeholder} 
                value={currentValue || ''} 
                onChange={(e) => handleOptionSelect(e.target.value)} 
                className="w-full p-3 sm:p-4 bg-transparent border-b-2 border-white/30 text-white text-lg sm:text-xl text-center placeholder:text-white/50 focus:outline-none focus:border-white transition-colors"
            />
        )}
    </div>

    {/* Bottom divider line */}
    <div className="w-40 sm:w-48 md:w-60 h-px bg-white opacity-50 my-3 sm:my-4 mx-auto"></div>

    {/* Styled Error Message */}
    {error && (
        <div className="bg-red-500/20 border border-red-500 text-white p-3 mb-4 sm:mb-6 rounded-lg text-center text-sm sm:text-base">
            <p>{error}</p>
        </div>
    )}
    
    {/* New Navigation and Progress Area */}
    <div className="flex justify-between items-center mt-auto pt-2">
        <button 
            onClick={handleBack} 
            disabled={questionIndex === 0 || isSubmitting} 
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white/10 border border-white/20 rounded-full disabled:opacity-30 hover:bg-white/20 transition-colors"
        >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        
        <div className="flex flex-col items-center px-2">
            <div className="w-32 sm:w-40 md:w-60 bg-white/20 rounded-full h-1">
                <div className="bg-white h-1 rounded-full transition-all duration-300" style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}></div>
            </div>
            <span className="text-white/80 font-light mt-2 text-xs sm:text-sm text-center whitespace-nowrap">
                Question {questionIndex + 1} of {questions.length}
            </span>
        </div>
        
        <button 
            onClick={handleNext} 
            disabled={isSubmitting} 
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white/10 border border-white/20 rounded-full disabled:opacity-30 hover:bg-white/20 transition-colors"
        >
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
    </div>
</div>
    </div>
  );
};

export default Questionnaire;

