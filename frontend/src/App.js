import React, { useState } from 'react';
import Questionnaire from './components/Questionnaire';
import LoadingScreen from './components/LoadingScreen';
import ChatInterface from './components/ChatInterface';
import './index.css';

function App() {
  const [currentStage, setCurrentStage] = useState('questionnaire');
  const [sessionData, setSessionData] = useState(null);

  const handleQuestionnaireComplete = (data) => {
    console.log('Questionnaire successful. Session data:', data);
    setSessionData(data);
    setCurrentStage('loading');
  };

  const handleLoadingComplete = () => {
    console.log('Loading complete, proceeding to chat.');
    setCurrentStage('chat');
  };

  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'questionnaire':
        return <Questionnaire onComplete={handleQuestionnaireComplete} />;
      case 'loading':
        return <LoadingScreen onComplete={handleLoadingComplete} />;
      case 'chat':
        return <ChatInterface sessionData={sessionData} />;
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

