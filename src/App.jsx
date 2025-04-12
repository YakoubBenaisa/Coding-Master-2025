import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/forms/auth/Login';
import Register from './components/forms/auth/Register';
import useAuthStore from './store/authStore';
import AddMember from './components/forms/teaMembers/AddMember';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Router>
      <Routes>

        <Route path="/login" element={<Login />} />

       <Route path='/register' element={<Register/>}/>

       <Route path='/add-members' element={<AddMember/>}/>
       <Route path='/admin' element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}/>
      </Routes>
    </Router>
  );
}

export default App;
