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