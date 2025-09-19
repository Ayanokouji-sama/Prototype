import React, { useState, useEffect } from 'react';
import Questionnaire from './components/Questionnaire';
import LoadingScreen from './components/LoadingScreen';
import ChatInterface from './components/ChatInterface';
import CareerRoadmap from './components/CareerRoadmap';
import VideoBackground from './components/VideoBackground';
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

  const handleNavigateToRoadmap = () => {
    console.log('Navigating to career roadmap.');
    setCurrentStage('roadmap');
  };

  const handleStartNewSession = () => {
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
      <VideoBackground /> {/* <-- 2. ADD IT HERE */}
      {renderCurrentStage()}
    </div>
  );
}

export default App;

