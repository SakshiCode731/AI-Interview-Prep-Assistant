import API from './api';

export const sendAgentMessage = async (message, sessionId = null) => {
  const response = await API.post('/mock-interview/agent/chat', {
    message,
    sessionId,
  });
  return response.data; // { reply, sessionId }
};