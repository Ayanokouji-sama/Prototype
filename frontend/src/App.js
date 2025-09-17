import React, { useState, useEffect } from 'react';
import Questionnaire from './components/Questionnaire';
import LoadingScreen from './components/LoadingScreen';
import ChatInterface from './components/ChatInterface';
import CareerRoadmap from './components/CareerRoadmap';
import './index.css';

function App() {
  const [currentStage, setCurrentStage] = useState(() => localStorage.getItem('currentStage') || 'questionnaire');
  const [sessionData, setSessionData] = useState(() => JSON.parse(localStorage.getItem('sessionData')) || null);

  useEffect(() => {
    localStorage.setItem('currentStage', currentStage);
    localStorage.setItem('sessionData', JSON.stringify(sessionData));
  }, [currentStage, sessionData]);



  const handleQuestionnaireComplete = (data) => {
    console.log('Questionnaire successful. Session data:', data);
    setSessionData(data);
    setCurrentStage('loading');
  };

  const handleLoadingComplete = () => {
    console.log('Loading complete, proceeding to chat.');
    setCurrentStage('chat');
  };

  const handleNavigateToRoadmap = () => {
    console.log('Navigating to career roadmap.');
    setCurrentStage('roadmap');
  };

  const handleStartNewSession = () => {
    localStorage.removeItem('currentStage');
    localStorage.removeItem('sessionData');
    setCurrentStage('questionnaire');
    setSessionData(null);
  };

  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'questionnaire':
        return <Questionnaire onComplete={handleQuestionnaireComplete} />;
      case 'loading':
        return <LoadingScreen onComplete={handleLoadingComplete} />;
      case 'chat':
        return <ChatInterface sessionData={sessionData} onNavigateToRoadmap={handleNavigateToRoadmap} />;
      case 'roadmap':
        return <CareerRoadmap sessionData={sessionData} onStartNewSession={handleStartNewSession} />;
      default:
        return <Questionnaire onComplete={handleQuestionnaireComplete} />;
    }
  };

  return (
    <div className="font-sans antialiased text-gray-800">
      {renderCurrentStage()}
    </div>
  );
}

export default App;

