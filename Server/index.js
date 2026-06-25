const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const readinessRoutes = require('./routes/readinessRoutes');
const mockInterviewRoutes = require('./routes/mockInterviewRoutes');
const answerEvaluatorRoutes = require('./routes/answerEvaluatorRoutes');


connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/readiness', readinessRoutes);
app.use('/api/mock-interview', mockInterviewRoutes);
app.use('/api/answer', answerEvaluatorRoutes);


app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});