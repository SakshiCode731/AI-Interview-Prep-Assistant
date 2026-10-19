import API from './api';

export const sendAgentMessage = async (message, sessionId = null) => {
  const response = await API.post('/mock-interview/agent/chat', {
    message,
    sessionId,
  });
  return response.data; // { reply, sessionId }
};

export const listAgentSessions = async () => {
  const response = await API.get('/mock-interview/agent/sessions');
  return response.data.sessions; // array of { sessionId, title, preview, updatedAt, createdAt }
};

export const getAgentSession = async (sessionId) => {
  const response = await API.get(`/mock-interview/agent/sessions/${sessionId}`);
  return response.data; // { sessionId, title, messages }
};
//this file contains functions to interact with the agent endpoints on the server. The functions include sending a message to the agent, listing all agent sessions, and retrieving a specific agent session by its ID. Each function uses the API module to make HTTP requests to the corresponding endpoints and returns the relevant data from the server's response.