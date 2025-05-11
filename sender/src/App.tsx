import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Status from './pages/Status';

const App: React.FC = () => {
  return (
    <Router>
      <nav style={{ padding: '1rem' }}>
        <Link to="/">Accueil</Link> | <Link to="/status">Status</Link>
      </nav>
      <Routes>
        <Route path="/" element={<h1>Bienvenue sur le forum</h1>} />
        <Route path="/status" element={<Status />} />
      </Routes>
    </Router>
  );
};

export default App;
