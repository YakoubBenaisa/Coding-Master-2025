import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/forms/auth/Login';
import Register from './components/forms/auth/Register';
import useAuthStore from './store/authStore';
import AddMember from './components/forms/teaMembers/AddMember';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import ProjectForm from './pages/RegisterProject';
import StudentProjects from './pages/StudentProjects';
import Home from './pages/Home';
import About from './pages/About';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path='/register' element={<Register/>}/>
        <Route path='/add-members' element={<AddMember/>}/>
        <Route path='/create-project' element={<ProjectForm/>}/>
        <Route path='/admin' element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}/>
        <Route path='/supervisor' element={<ProtectedRoute><SupervisorDashboard /></ProtectedRoute>}/>
        <Route path='/supervisyer' element={<ProtectedRoute><SupervisorDashboard /></ProtectedRoute>}/>
        <Route path='/student/projects' element={<ProtectedRoute><StudentProjects /></ProtectedRoute>}/>
        <Route path='/student' element={<Navigate to='/student/projects' replace />}/>
      </Routes>
    </Router>
  );
}

export default App;
