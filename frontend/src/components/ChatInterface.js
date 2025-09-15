import React, { useState, useEffect, useRef } from 'react';
import { getChatHistory, sendMessage, uploadResume } from '../services/api';
import { Menu, User, Send, Mic, Paperclip } from 'lucide-react';
import counselorAvatar from '../assets/avatar.png';

// This component uses YOUR original logic with the NEW design.
const ChatInterface = ({ sessionData }) => {
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
          const utterance = new SpeechSynthesisUtterance(uploadResponse.ai_response.message);
          speechSynthesis.speak(utterance);
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
          const utterance = new SpeechSynthesisUtterance(response.ai_response.message);
          speechSynthesis.speak(utterance);
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
    <div className="h-screen w-screen bg-cover bg-center text-white font-glory brightness-125 overflow-hidden" style={{ backgroundImage: `url('/background.png')` }}>
  <div className="h-full w-full bg-black bg-opacity-15 backdrop-blur-light flex flex-col p-4 sm:p-6 md:p-8 lg:p-12 overflow-hidden">
        
        {/* Header */}
<header className="flex items-center justify-between flex-shrink-0 px-4 sm:px-6 md:px-8">
  <div className="flex items-center gap-0">
    <button className="p-2 sm:p-3 bg-black bg-opacity-100 rounded-full hover:bg-opacity-70 transition z-10">
      <Menu size={24} className="text-white sm:hidden" />
      <Menu size={32} className="text-white hidden sm:block md:hidden" />
      <Menu size={40} className="text-white hidden md:block" />
    </button>
    <div className="px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 py-2 sm:py-3 md:py-4 bg-white bg-opacity-10 rounded-full -ml-8 sm:-ml-12 md:-ml-16">
      <span className="font-light text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-black ml-2 sm:ml-3 md:ml-4 whitespace-nowrap">
        Career Session
      </span>
    </div>
  </div>
  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#64855f]/75">*</div>
  <button className="p-2 sm:p-3 md:p-4 bg-black bg-opacity-100 rounded-full hover:bg-opacity-70 transition">
    <User size={20} className="sm:hidden" />
    <User size={28} className="hidden sm:block md:hidden" />
    <User size={34} className="hidden md:block" />
  </button>
</header>

        {/* Main Content */}
<main className="flex-1 flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 lg:gap-10 mt-4 sm:mt-6 md:mt-8 mb-2 overflow-hidden shadow-black">
          
          {/* Left Sidebar */}
<aside className="w-full md:w-80 lg:w-[400px] flex flex-col ml-0 md:ml-3 lg:ml-5 h-auto md:h-full relative transition backdrop-blur-sm order-2 md:order-1">
  <div 
    className="h-auto md:h-full bg-white bg-opacity-10 backdrop-blur-md p-4 lg:p-6 flex flex-col rounded-3xl md:rounded-[48px]"
    style={{
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 43%, 90% 46%, 90% 54%, 100% 57%, 100% 100%, 0% 100%, 0% 57%, 10% 54%, 10% 46%, 0% 43%)'
    }}
  >
    {/* Top section */}
    <div className="flex-1 mb-4">
      {/* START: Counselor Avatar Section */}
      <div className="flex flex-col items-center text-center">
        <img 
          src={counselorAvatar} 
          alt="Counselor Mr. Lee"
          className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-58 lg:h-56 mt-4 sm:mt-6 md:mt-8 lg:mt-10 mb-4 sm:mb-6 md:mb-8 lg:mb-12 opacity-90 rounded-full"
        />
        <h3 className="mt-2 md:mt-4 text-xl sm:text-xl md:text-2xl font-glory font-light text-white">Marvin</h3>
        <p className="text-base sm:text-lg text-white/80">Career Counselor</p>
      </div>
    </div>
    
    {/* Chat Log section */}
    <div className="h-auto md:h-64">
      <div className="outline-black mt-0 text-center py-2 sm:py-3 mb-3 sm:mb-4 bg-white bg-opacity-100 text-black rounded-full font-light text-base sm:text-lg md:text-xl">
        Chat Log
      </div>
      {/* Chat history in a rounded container like Figma */}
      <div className="bg-white bg-opacity-0 text-black backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-4 max-h-32 sm:max-h-36 md:max-h-44 overflow-hidden outline-white">
        <ul className="text-xs sm:text-sm space-y-1 sm:space-y-2 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
          {messages.map(msg => (
            <li key={msg.message_id} className="truncate text-white opacity-90 font-light text-sm sm:text-base md:text-lg">
              • {msg.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
</aside>

          {/* Chat Area */}
<section className="font-roboto-flex flex-1 flex flex-col bg-white bg-opacity-5 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 mr-0 md:mr-3 lg:mr-5 shadow-2xl shadow-black/40 order-1 md:order-2 min-h-0 max-h-full">

  {/* Message list container - CRITICAL FIXES */}
<div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 md:space-y-6 pr-1 sm:pr-2 custom-scrollbar min-h-0">
  {isLoading ? (
    <div className="flex justify-center items-center h-full min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-white"></div>
    </div>
  ) : (
    messages.map((msg) => <MessageBubble key={msg.message_id} message={msg} />)
  )}
  {isTyping && <TypingIndicator />}
  <div ref={messagesEndRef} />
</div>

{/* Input area - FIXED AT BOTTOM */}
<div className="mt-3 sm:mt-4 md:mt-6 flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
  
  {/* Item 1: The Input Bar */}
  <div className="input-glow-line flex-1 flex items-center gap-2 sm:gap-3 bg-white text-black text-base sm:text-lg backdrop-blur-lg rounded-full p-1 sm:p-2">
    <input 
      ref={inputRef}
      type="text"
      value={inputMessage}
      onChange={(e) => setInputMessage(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder="Type Your Career Question..."
      className="flex-1 bg-transparent px-3 sm:px-4 py-2 text-black placeholder-gray-600 focus:outline-none text-sm sm:text-base md:text-lg min-w-0"
      disabled={isTyping || isLoading}
    />
    <button
      onClick={handleSendMessage}
      disabled={!inputMessage.trim() || isTyping || isLoading}
      className="p-2 sm:p-3 bg-white text-black rounded-full hover:bg-gray-200 disabled:opacity-50 transition flex-shrink-0"
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
    className="p-2 sm:p-3 md:p-4 bg-black bg-opacity-100 rounded-full hover:bg-opacity-80 transition text-white flex-shrink-0">
    <Paperclip size={18} className="sm:hidden" />
    <Paperclip size={20} className="hidden sm:block md:hidden" />
    <Paperclip size={24} className="hidden md:block" />
  </button>

  {/* Item 2: The Standalone Mic Button */}
  <button className="p-2 sm:p-3 md:p-4 bg-black bg-opacity-100 rounded-full hover:bg-opacity-80 transition text-white flex-shrink-0">
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
const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';
  
  // Fixed classes - removed conflicts
  const userBubbleClass = 'bg-[#64855f]/75 text-white';
  const aiBubbleClass = 'bg-white/10 text-black';

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
        p-3 
        sm:p-4 
        rounded-2xl 
        sm:rounded-3xl 
        backdrop-blur-xl 
        shadow-lg 
        ${isUser ? userBubbleClass : aiBubbleClass}
      `}>
        {/* FIXED: Remove text-black for user messages */}
        <p className={`whitespace-pre-wrap leading-relaxed opacity-90 hyphens-none break-words text-sm sm:text-base ${
          isUser ? 'text-white' : 'text-black'
        }`}>
          {message.message}
        </p>
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

