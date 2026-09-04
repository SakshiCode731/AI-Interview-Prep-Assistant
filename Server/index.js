const dotenv = require('dotenv');
dotenv.config();

const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

const http = require('http');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { generalLimiter } = require('./middleware/rateLimiter');
const { initSocket } = require('./socket');
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const readinessRoutes = require('./routes/readinessRoutes');
const mockInterviewRoutes = require('./routes/mockInterviewRoutes');
const answerEvaluatorRoutes = require('./routes/answerEvaluatorRoutes');
const chatRoutes = require('./routes/chatRoutes');
const systemDesignRoutes = require('./routes/systemDesignRoutes');
const notificationRoutes = require('./routes/notifications');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(generalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/readiness', readinessRoutes);
app.use('/api/mock-interview', mockInterviewRoutes);
app.use('/api/answer', answerEvaluatorRoutes);
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/chat', chatRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/system-design', systemDesignRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

Sentry.setupExpressErrorHandler(app);

const PORT = process.env.PORT || 5000;

// http server wraps the express app so socket.io can attach to the same port
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});