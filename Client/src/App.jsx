import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import ReadinessScore from './pages/ReadinessScore';
import MockInterview from './pages/MockInterview';
import AnswerEvaluator from './pages/AnswerEvaluator';
import CompanyPrep from './pages/CompanyPrep';
import Chatbot from './pages/Chatbot';
import DressingGuide from './pages/DressingGuide';
import ConfidenceGuide from './pages/ConfidenceGuide';
import BehaviorGuide from './pages/Behavior';
import Bookmarks from './pages/Bookmarks';
import ProgressReport from './pages/ProgressReport';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/resume" element={
        <ProtectedRoute><ResumeUpload /></ProtectedRoute>
      } />
      <Route path="/readiness" element={
        <ProtectedRoute><ReadinessScore /></ProtectedRoute>
      } />
      <Route path="/mock-interview" element={
        <ProtectedRoute><MockInterview /></ProtectedRoute>
      } />
      <Route path="/answer-evaluator" element={
        <ProtectedRoute><AnswerEvaluator /></ProtectedRoute>
      } />
      <Route path="/companies" element={
        <ProtectedRoute><CompanyPrep /></ProtectedRoute>
      } />
      <Route path="/chatbot" element={
        <ProtectedRoute><Chatbot /></ProtectedRoute>
      } />
      <Route path="/dressing-guide" element={
        <ProtectedRoute><DressingGuide /></ProtectedRoute>
      } />
      <Route path="/confidence-guide" element={
        <ProtectedRoute><ConfidenceGuide /></ProtectedRoute>
      } />
      <Route path="/behavior-guide" element={
        <ProtectedRoute><BehaviorGuide /></ProtectedRoute>
      } />
      <Route path="/bookmarks" element={
        <ProtectedRoute><Bookmarks /></ProtectedRoute>
      } />
      <Route path="/progress" element={
        <ProtectedRoute><ProgressReport /></ProtectedRoute>
      } />
    </Routes>
  );
};

export default App;