import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/forms/auth/Login';
import Register from './components/forms/auth/Register';
import useAuthStore from './store/authStore';
import AddMember from './components/forms/teaMembers/AddMember';
import ProjectForm from './pages/RegisterProject';
function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Router>
      <Routes>
       
        <Route path="/login" element={<Login />} />
       
       <Route path='/register' element={<Register/>}/>
    
       <Route path='/add-members' element={<AddMember/>}/>
       <Route path='/create-project' element={<ProjectForm/>}/>
      </Routes>
    </Router>
  );
}

export default App;
