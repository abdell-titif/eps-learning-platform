import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Login component
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({
        email: e.target.email.value,
        password: e.target.password.value,
      });
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

// Register component
const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        name: e.target.name.value,
        email: e.target.email.value,
        password: e.target.password.value,
        role: e.target.role.value,
      });
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h2>Register</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Full Name" required />
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <select name="role" required>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

// Main App component
function App() {
  const { user, logout } = useAuth();

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-brand">EPS Learning Platform</div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/courses">Courses</Link></li>
            <li><Link to="/exercises">Exercises</Link></li>
            <li><Link to="/progress">Progress</Link></li>
            {user ? (
              <li><button onClick={logout}>Logout</button></li>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <>
                <section className="hero-section">
                  <h1>Welcome to EPS Learning Platform</h1>
                  <p>Your comprehensive platform for physical education learning</p>
                </section>
                <section className="features-section">
                  <h2>Features</h2>
                  <div className="features-grid">
                    <div className="feature-card">
                      <h3>Interactive Courses</h3>
                      <p>Learn through engaging video content and interactive exercises</p>
                    </div>
                    <div className="feature-card">
                      <h3>Progress Tracking</h3>
                      <p>Monitor your learning journey and achievements</p>
                    </div>
                    <div className="feature-card">
                      <h3>Expert Guidance</h3>
                      <p>Get guidance from experienced physical education instructors</p>
                    </div>
                  </div>
                </section>
              </>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Wrap the app with AuthProvider
export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
