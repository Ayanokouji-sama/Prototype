import React, { useState, useEffect } from 'react';
import { Menu, User } from 'lucide-react'; 
import { ReactComponent as MyLogo } from '../assets/my-logo.svg';

// Helper function to fetch data from your API
async function fetchRoadmapData(sessionId) {
    const response = await fetch(`/api/roadmap/${sessionId}/`);
    if (!response.ok) {
        throw new Error('Failed to fetch roadmap data.');
    }
    return response.json();
}

// A single card component to display a career option
const CareerCard = ({ option }) => {
    return (
        // --- CHANGES: Reduced padding (p-4) and margin-bottom (mb-4) ---
        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white/40 rounded-2xl shadow-lg p-4 mb-4">
            {/* --- CHANGE: Smaller title font size (text-xl) --- */}
            <h3 className="text-xl font-bold font-roboto-flex text-white opacity-90 mb-2">{option.title || option['Occupation Title']}</h3>
            
            {/* --- CHANGE: Smaller body font size (text-sm) --- */}
            <p className="text-white font-light font-roboto-flex opacity-80 text-sm mb-3">{option.reasoning}</p>

            <div className="mb-3">
                {/* --- CHANGE: Smaller subheading font size (text-base) --- */}
                <h4 className="font-normal font-roboto-flex text-white opacity-80 text-base mb-2">Key Skills Required:</h4>
                <div className="flex flex-wrap gap-2">
                    {option.skills && option.skills.map((skill, index) => (
                        // --- CHANGE: Smaller skill "pills" ---
                        <span key={index} className="bg-white/80 text-black opacity-80 text-xs font-medium px-2.5 py-1 rounded-full">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            {option.salary && (
                 <div className="mb-3">
                    <h4 className="font-normal font-roboto-flex text-white/90 text-sm">Expected Salary Range:</h4>
                    <p className="text-white/70 text-sm">{option.salary}</p>
                </div>
            )}

            {option.growth && (
                 <div className="mb-3">
                    <h4 className="font-normal font-roboto-flex text-white/90 text-sm">5-Year Growth Potential:</h4>
                    <p className="text-white/70 text-sm">{option.growth}</p>
                </div>
            )}

            {option.courses && option.courses.length > 0 && (
                <div>
                    <h4 className="font-normal font-roboto-flex text-white/90 text-sm mb-2">Recommended Courses:</h4>
                    <ul className="list-disc list-inside space-y-1 text-white/80">
                        {option.courses.map((course, index) => (
                            <li key={index} className="text-sm">
                                <a 
                                   href={course.url} 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   className="!text-cyan-400 hover:!text-cyan-300 hover:underline no-underline transition-colors"
                                >
                                    {course.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


// The main page component
const CareerRoadmap = ({ sessionData, onStartNewSession }) => {
    const sessionId = sessionData?.session_id;
    const [roadmapData, setRoadmapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (sessionId) {
            fetchRoadmapData(sessionId)
                .then(data => {
                    setRoadmapData(data.roadmap);
                    setLoading(false);
                })
                .catch(err => {
                    setError('Could not load your career roadmap. Please try again later.');
                    setLoading(false);
                });
        } else {
            setError('No session data found.');
            setLoading(false);
        }
    }, [sessionId]);

    if (loading) {
        return <div className="text-center p-10 font-glory">Loading your personalized roadmap...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">{error}</div>;
    }

    return (
        <div className="min-h-screen w-full p-4 sm:p-8">
        
        <header className="flex items-center justify-between flex-shrink-0 px-3 sm:px-4 md:px-6 mb-8">
            <div className="w-1/3">
        <div className="flex items-center gap-0">
            <button className="p-2 sm:p-2 bg-black bg-opacity-80 rounded-full hover:bg-opacity-70 transition z-10">
                <Menu size={18} className="text-white sm:hidden" />
                <Menu size={24} className="text-white hidden sm:block md:hidden" />
                <Menu size={32} className="text-white hidden md:block" />
            </button>
            <div className="px-3 sm:px-6 md:px-9 lg:px-12 xl:px-18 py-1.5 sm:py-2 md:py-3 bg-white bg-opacity-10 rounded-full -ml-6 sm:-ml-9 md:-ml-12">
            <span className="font-light text-xs sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white ml-1.5 sm:ml-2 md:ml-3 whitespace-nowrap">
              RoadMap
            </span>
          </div>
        </div>
    </div>

    {/* Center container (auto width) */}
    <div className="flex justify-center">
        <MyLogo className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
    </div>

    {/* Right container (takes up 1/3, content pushed to the right) */}
    <div className="w-1/3 flex justify-end">
        <button className="p-1.5 sm:p-2 md:p-3 bg-black bg-opacity-80 rounded-full hover:bg-opacity-70 transition">
            <User size={20} className="text-white sm:hidden" />
            <User size={21} className="text-white hidden sm:block md:hidden" />
            <User size={28} className="text-white hidden md:block" />
        </button>
    </div>
        </header>
        
        <div className="max-w-7xl mx-auto">
            {/* The title and subtitle text should be white to be visible */}
            <h1 className="text-3xl font-extrabold text-white mb-1 text-center">Your Personalized Career Roadmap</h1>
            <p className="text-lg text-white/90 font-glory mb-6 text-center">Here are a few potential paths based on our conversation.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roadmapData && roadmapData.map((option, index) => (
                    <CareerCard key={index} option={option} />
                ))}
            </div>

            <div className="text-center mt-8">
                <button 
                onClick={onStartNewSession} 
                className="bg-white/80 text-black font-semibold text-lg py-3 px-8 rounded-full font-glory hover:bg-gray-200 transition-all duration-200 shadow-lg"
                >
                Start a New Session
                </button>
            </div>
        </div>
    </div>
    );
};

export default CareerRoadmap;