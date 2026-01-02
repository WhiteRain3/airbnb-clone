import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import Game from './pages/Game';
import Home from './pages/Home';
import HostDashboard from './pages/HostDashboard';
import ListingDetails from './pages/ListingDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import { AuthService } from './services/auth';

function App() {
  const user = AuthService.getUser();
  const role = AuthService.getRole();

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/listing/:id" element={<ListingDetails />} />
            <Route path="/dashboard" element={user ? <UserDashboard /> : <Navigate to="/login" />} />
            <Route path="/host" element={role === 'host' ? <HostDashboard /> : <Navigate to="/" />} />
            <Route path="/admin" element={role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />          
            <Route path="/game" element={<Game />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
export default App;