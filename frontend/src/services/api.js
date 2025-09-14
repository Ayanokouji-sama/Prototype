// Use relative URL since we have proxy configured in package.json
const API_BASE_URL = '/api';

async function makeRequest(endpoint, options = {}) {
  try {
    console.log('Making request to:', `${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Non-JSON response:', textResponse);
      throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 100)}...`);
    }
    
    const responseData = await response.json();
    if (!response.ok) {
      console.error('API Error Response:', responseData);
      throw responseData; 
    }
    return responseData;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export const submitQuestionnaire = async (userData) => {
  return makeRequest('/submit_questionnaire/', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const sendMessage = async (message, sessionId) => {
  return makeRequest('/send_message/', {
    method: 'POST',
    body: JSON.stringify({ message: message, session_id: sessionId }),
  });
};

export const getChatHistory = async (sessionId) => {
  return makeRequest(`/get_chat_history/${sessionId}/`);
};

export const uploadResume = async (file, sessionId) => {
  // We use FormData to handle file uploads, which is different from JSON.
  const formData = new FormData();
  formData.append('resume', file); // 'resume' is the key the backend will look for.
  formData.append('session_id', sessionId);

  try {
    console.log('Uploading file to:', `${API_BASE_URL}/resume/upload/`);
    
    // We use a separate fetch call here because FormData handles its own headers.
    const response = await fetch(`${API_BASE_URL}/resume/upload/`, {
      method: 'POST',
      body: formData,
    });

    const responseData = await response.json();
    if (!response.ok) {
      console.error('API Error Response (File Upload):', responseData);
      throw responseData;
    }
    return responseData;

  } catch (error) {
    console.error('File upload request failed:', error);
    throw error;
  }
};