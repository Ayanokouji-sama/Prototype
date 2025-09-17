import React, { useState, useEffect } from 'react';

// Helper function to fetch data from your API
async function fetchRoadmapData(sessionId) {
    const response = await fetch(`/api/roadmap/${sessionId}/`);
    if (!response.ok) {
        throw new Error('Failed to fetch roadmap data.');
    }
    return response.json();
}

// A single card component to display a career option (No changes here)
const CareerCard = ({ option }) => {
    // ... (This component remains exactly the same as before)
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 mb-6 transition-transform transform hover:scale-105">
            <h3 className="text-2xl font-bold text-blue-600 mb-3">{option.title || option['Occupation Title']}</h3>
            
            <p className="text-gray-700 mb-4">{option.reasoning}</p>

            <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Key Skills Required:</h4>
                <div className="flex flex-wrap gap-2">
                    {option.skills && option.skills.map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            {option.salary && (
                 <div className="mb-4">
                    <h4 className="font-semibold text-gray-800">Expected Salary Range:</h4>
                    <p className="text-gray-600">{option.salary}</p>
                </div>
            )}

            {option.growth && (
                 <div className="mb-4">
                    <h4 className="font-semibold text-gray-800">5-Year Growth Potential:</h4>
                    <p className="text-gray-600">{option.growth}</p>
                </div>
            )}

            {option.courses && option.courses.length > 0 && (
                <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Recommended Courses (Coursera):</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {option.courses.map((course, index) => (
                            <li key={index}>
                                <a href={course} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                    {course.split('/').pop().replace(/-/g, ' ')}
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
    // Get the session ID from the prop, NOT from the URL
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
        return <div className="text-center p-10">Loading your personalized roadmap...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">{error}</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-2 text-center">Your Personalized Career Roadmap</h1>
                <p className="text-lg text-gray-600 mb-8 text-center">Here are a few potential paths based on our conversation.</p>
                
                {roadmapData && roadmapData.map((option, index) => (
                    <CareerCard key={index} option={option} />
                ))}

                <div className="text-center mt-8">
                    {/* Replaced the <Link> component with a simple button */}
                    <button onClick={onStartNewSession} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700">
                        Start a New Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CareerRoadmap;