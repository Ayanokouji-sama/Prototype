import React, { useState, useEffect, useRef } from 'react';
import { getChatHistory, sendMessage, uploadResume } from '../services/api';
import { Menu, User, Send, Mic, Paperclip } from 'lucide-react';
import counselorAvatar from '../assets/avatar.png';
import { ReactComponent as MyLogo } from '../assets/my-logo.svg';

// This component uses YOUR original logic with the NEW design.
const ChatInterface = ({ sessionData, onNavigateToRoadmap }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const sessionId = sessionData?.session_id;

  // Your original useEffect for loading chat history - NO CHANGES
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!sessionId) {
        setIsLoading(false);
        setMessages([{ message_id: 'error', message: 'Error: No valid session ID found.', sender: 'ai' }]);
        return;
      }
      try {
        const response = await getChatHistory(sessionId);
        if (response && response.messages) {
          setMessages(response.messages);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
        setMessages([{ message_id: 'error_fetch', message: 'Failed to load message history.', sender: 'ai' }]);
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };
    loadChatHistory();
  }, [sessionId]);

  // Your original auto-scroll logic - NO CHANGES
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Your original function for sending messages - NO CHANGES
  const handleSendMessage = async () => {
    // Prevent sending if the AI is already typing or there's no valid input.
    if (isTyping || (!inputMessage.trim() && !selectedFile) || !sessionId) return;

    // --- LOGIC FOR HANDLING FILE UPLOADS (NOW CORRECTED) ---
    if (selectedFile) {
      const file = selectedFile;
      // Show an immediate "uploading" state to the user.
      setInputMessage(`Uploading: ${file.name}`);
      setIsTyping(true); 

      try {
        // Step 1: Actually upload the file using the API function.
        // IMPORTANT: Make sure 'uploadResume' is imported from your api.js file.
        const uploadResponse = await uploadResume(file, sessionId);

        // Step 2: Add the user's confirmation message and the AI's response to the chat.
        const userFileMessage = {
          message_id: `user_file_${Date.now()}`,
          message: `You sent a file: ${file.name}`,
          sender: 'user',
          timestamp: new Date().toISOString()
        };
        
        // The backend's 'upload_resume' view should return the AI's response.
        if (uploadResponse.success && uploadResponse.ai_response) {
          setMessages(prev => [...prev, userFileMessage, uploadResponse.ai_response]);
          // Speak the AI's response after the file is analyzed.
          
        } else {                     
          // This handles cases where the upload works but the AI fails to respond.
          throw new Error("File upload succeeded, but no AI response was received.");
        }

      } catch (error) {
        console.error('Error uploading file:', error);
        const errorMessage = { message_id: `err_${Date.now()}`, message: "Sorry, there was a problem uploading your file. Please try again.", sender: 'ai', timestamp: new Date().toISOString() };
        // Show the user's file message even on error, so they know the app tried.
        setMessages(prev => [...prev, { message_id: `user_file_${Date.now()}`, message: `Failed to send file: ${file.name}`, sender: 'user', timestamp: new Date().toISOString() }, errorMessage]);
      } finally {
        // Reset the state regardless of success or failure.
        setSelectedFile(null);
        setInputMessage('');
        setIsTyping(false);
        inputRef.current?.focus();
      }

    // --- LOGIC FOR HANDLING TEXT MESSAGES (YOUR ORIGINAL CODE, UNCHANGED) ---
    } else {
      const userMessage = { 
        message_id: `user_${Date.now()}`,
        message: inputMessage,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      const currentInput = inputMessage;
      setInputMessage('');
      setIsTyping(true);

      try {
        const response = await sendMessage(currentInput, sessionId);
        if (response.success && response.ai_response) {
          setMessages(prev => [...prev, response.ai_response]);
          
        } else {
          throw new Error("Invalid AI response from backend.");
        }
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = { message_id: `err_${Date.now()}`, message: "I'm sorry, an error occurred. Please try again.", sender: 'ai', timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
        inputRef.current?.focus();
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Optional: show a confirmation message in the input bar
      setInputMessage(`File selected: ${file.name}`); 
    }
  };

  // --- NEW JSX FOR THE VISUAL DESIGN ---
  
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 text-white relative overflow-hidden">
    <div className="h-full w-full bg-black bg-opacity-15 backdrop-blur-light flex flex-col p-3 sm:p-4 md:p-6 lg:p-8 overflow-hidden">
      
      {/* Header */}
      <header className="flex items-center justify-between flex-shrink-0 px-3 sm:px-4 md:px-6">
        <div className="flex items-center gap-0">
          <button className="p-1.5 sm:p-2 bg-black bg-opacity-100 rounded-full hover:bg-opacity-70 transition z-10">
            <Menu size={18} className="text-white sm:hidden" />
            <Menu size={24} className="text-white hidden sm:block md:hidden" />
            <Menu size={30} className="text-white hidden md:block" />
          </button>
          <div className="px-3 sm:px-6 md:px-9 lg:px-12 xl:px-18 py-1.5 sm:py-2 md:py-3 bg-white bg-opacity-10 rounded-full -ml-6 sm:-ml-9 md:-ml-12">
            <span className="font-light text-xs sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white ml-1.5 sm:ml-2 md:ml-3 whitespace-nowrap">
              Career Session
            </span>
          </div>
        </div>
        <MyLogo className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
        <button className="p-1.5 sm:p-2 md:p-3 bg-black bg-opacity-100 rounded-full hover:bg-opacity-70 transition">
          <User size={16} className="sm:hidden" />
          <User size={21} className="hidden sm:block md:hidden" />
          <User size={26} className="hidden md:block" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-6 lg:gap-8 mt-3 sm:mt-4 md:mt-6 mb-2 overflow-hidden shadow-black">
        
        {/* Left Sidebar */}
        <aside className="w-full md:w-64 lg:w-80 flex flex-col ml-0 md:ml-2 lg:ml-4 h-auto md:h-full relative transition backdrop-blur-sm order-2 md:order-1">
          <div 
            className="h-auto md:h-full bg-white bg-opacity-10 backdrop-blur-md p-3 lg:p-4 flex flex-col rounded-2xl md:rounded-[36px]"
            style={{
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 43%, 90% 46%, 90% 54%, 100% 57%, 100% 100%, 0% 100%, 0% 57%, 10% 54%, 10% 46%, 0% 43%)'
            }}
          >
            {/* Top section */}
            <div className="flex-1 mb-3">
              {/* START: Counselor Avatar Section */}
              <div className="flex flex-col items-center text-center">
                <img 
                  src={counselorAvatar} 
                  alt="Counselor Mr. Lee"
                  className="w-24 h-24 sm:w-30 sm:h-30 md:w-36 md:h-36 lg:w-44 lg:h-42 mt-3 sm:mt-4 md:mt-6 lg:mt-8 mb-3 sm:mb-4 md:mb-6 lg:mb-9 opacity-90 rounded-full"
                />
                <h3 className="mt-1.5 md:mt-3 text-lg sm:text-lg md:text-xl font-glory font-light text-white">Marvin</h3>
                <p className="text-sm sm:text-base text-white/80">Career Counselor</p>
              </div>
            </div>
            
            {/* Chat Log section */}
            <div className="h-auto md:h-48">
              <div className="outline-black mt-0 text-center py-1.5 sm:py-2 mb-2 sm:mb-3 bg-white bg-opacity-100 text-black rounded-full font-light text-sm sm:text-base md:text-lg">
                Chat Log
              </div>
              {/* Chat history in a rounded container like Figma */}
              <div className="bg-white bg-opacity-0 text-black backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 max-h-24 sm:max-h-27 md:max-h-33 overflow-hidden outline-white">
                <ul className="text-xs sm:text-xs space-y-0.5 sm:space-y-1 overflow-y-auto pr-1 sm:pr-1.5 custom-scrollbar">
                  {messages.map(msg => (
                    <li key={msg.message_id} className="truncate text-white opacity-90 font-light text-xs sm:text-sm md:text-base">
                      • {msg.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </aside>

          {/* Chat Area */}
<section className="font-roboto-flex flex-1 flex flex-col bg-white bg-opacity-5 backdrop-blur-lg rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 mr-0 md:mr-2 lg:mr-4 shadow-2xl shadow-black/40 order-1 md:order-2 min-h-0 max-h-full">

  {/* Message list container - CRITICAL FIXES */}
<div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 md:space-y-4 pr-1 sm:pr-1.5 custom-scrollbar min-h-0">
  {isLoading ? (
    <div className="flex justify-center items-center h-full min-h-[150px]">
      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 md:h-9 md:w-9 border-b-2 border-white"></div>
    </div>
  ) : (
    messages.map((msg) => <MessageBubble key={msg.message_id} message={msg} onNavigate={onNavigateToRoadmap} />)
  )}
  {isTyping && <TypingIndicator />}
  <div ref={messagesEndRef} />
</div>

{/* Input area - FIXED AT BOTTOM */}
<div className="mt-2 sm:mt-3 md:mt-4 flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
  
  {/* Item 1: The Input Bar */}
  <div className="input-glow-line flex-1 flex items-center gap-1.5 sm:gap-2 bg-white text-black text-sm sm:text-base backdrop-blur-lg rounded-full p-0.5 sm:p-1.5">
    <input 
      ref={inputRef}
      type="text"
      value={inputMessage}
      onChange={(e) => setInputMessage(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder="Type Your Career Question..."
      className="flex-1 bg-transparent px-2 sm:px-3 py-1.5 text-black placeholder-gray-600 focus:outline-none text-xs sm:text-sm md:text-base min-w-0"
      disabled={isTyping || isLoading}
    />
    <button
      onClick={handleSendMessage}
      disabled={!inputMessage.trim() || isTyping || isLoading}
      className="p-1.5 sm:p-2 bg-white text-black rounded-full hover:bg-gray-200 disabled:opacity-50 transition flex-shrink-0"
    >
      <Send size={16} className="sm:hidden" />
      <Send size={20} className="hidden sm:block" />
    </button>
  </div>
  
  {/* --- START: NEW ATTACHMENT BUTTON AND HIDDEN INPUT --- */}
  <input
    type="file"
    ref={fileInputRef}
    onChange={handleFileChange}
    className="hidden"
    accept=".pdf,.doc,.docx,.txt"
  />
  <button 
    onClick={handleFileSelect} 
    className="p-1.5 sm:p-2 md:p-3 bg-black bg-opacity-100 rounded-full hover:bg-opacity-80 transition text-white flex-shrink-0">
    <Paperclip size={18} className="sm:hidden" />
    <Paperclip size={20} className="hidden sm:block md:hidden" />
    <Paperclip size={24} className="hidden md:block" />
  </button>

  {/* Item 2: The Standalone Mic Button */}
  <button className="p-1.5 sm:p-2 md:p-3 bg-black bg-opacity-100 rounded-full hover:bg-opacity-80 transition text-white flex-shrink-0">
    <Mic size={18} className="sm:hidden" />
    <Mic size={20} className="hidden sm:block md:hidden" />
    <Mic size={24} className="hidden md:block" />
  </button>
  
</div>
</section>

        </main>
      </div>
      <style>{`
        .custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}
        .custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

        .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}
 
.message-content {
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: none; 
  white-space: pre-wrap;
}
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .input-glow-line {
    position: relative;
  }
  .input-glow-line::before {
    content: '';
    position: absolute;
    top: -1px; /* Position it just above the element's content */
    left: 5%;
    width: 90%;
    height: 2px;
    background: rgba(255, 255, 255, 0.4);
    filter: blur(3px); /* This creates the glow! */
    border-radius: 2px;
  }
      `}</style>
    </div>
  );
};

// UPDATED MessageBubble component to better match Figma
const MessageBubble = ({ message, onNavigate }) => {
  const isUser = message.sender === 'user';
  
  // Fixed classes - text color only defined here, not in paragraph
  const userBubbleClass = 'bg-[#64855f]/75 text-white';
  const aiBubbleClass = 'bg-white/10 text-white/80'; // Change this color as needed

  // --- Link Detection Logic ---
  const roadmapLinkText = '[View Your Roadmap]';
  const containsRoadmapLink = message.message.includes(roadmapLinkText);

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-[90%] 
        xs:max-w-[85%] 
        sm:max-w-[75%] 
        md:max-w-[65%] 
        lg:max-w-[55%] 
        xl:max-w-[50%] 
        2xl:max-w-[45%]
        p-2
        sm:p-3 
        rounded-xl 
        sm:rounded-2xl 
        backdrop-blur-xl 
        shadow-lg 
        ${isUser ? userBubbleClass : aiBubbleClass}
      `}>
        {containsRoadmapLink ? (
          // If it's the special link, render a button
          <div>
            <p className="whitespace-pre-wrap leading-relaxed opacity-90 break-words text-xs sm:text-sm mb-2">
              {message.message.split(roadmapLinkText)[0]} {/* Show text before the link */}
            </p>
            <button
              onClick={onNavigate}
              className="w-full text-center font-light text-white bg-[#64855f]/75 rounded-lg px-3 py-1.5 hover:bg-[#64855f]/100 transition-all duration-200 text-xs sm:text-sm"
            >
              View Your Roadmap
            </button>
          </div>
        ) : (
          // Otherwise, render the normal message text - NO text color classes here
          <p className="whitespace-pre-wrap leading-relaxed opacity-90 hyphens-none break-words text-xs sm:text-sm">
            {message.message}
          </p>
        )}
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex w-full justify-start">
    <div className="p-4 rounded-3xl bg-white bg-opacity-20 rounded-bl-lg backdrop-blur-xl shadow-lg">
      <div className="flex items-center space-x-1.5">
        <div className="w-2.5 h-2.5 bg-gray-300 rounded-full animate-bounce"></div>
        <div className="w-2.5 h-2.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2.5 h-2.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

export default ChatInterface;

