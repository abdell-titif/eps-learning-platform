import './App.css';

function App() {
  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-brand">EPS Learning Platform</div>
        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#courses">Courses</a></li>
          <li><a href="#exercises">Exercises</a></li>
          <li><a href="#progress">Progress</a></li>
        </ul>
      </nav>
      <main className="main-content">
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
      </main>
    </div>
  );
}

export default App;
