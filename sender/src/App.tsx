import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Status from './pages/Status';
import MessageForm from './pages/MessageForm';

const Home: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    {/* Hero */}
    <header className="bg-white shadow">
      <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
          Forum Anonyme - PaulD
        </h1>
        <nav className="mt-4 md:mt-0 space-x-4">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            Accueil
          </Link>
          <Link
            to="/status"
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            Status
          </Link>
          <Link
            to="/message"
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            Message
          </Link>
        </nav>
      </div>
    </header>

    {/* Main Hero Section */}
    <main className="flex-grow container mx-auto px-6 flex flex-col items-center justify-center text-center">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        Exprimez-vous en toute liberté
      </h2>
      <p className="text-gray-700 mb-8 max-w-2xl">
        Partagez vos pensées de manière anonyme et découvrez celles des autres. 
        Un forum simple, rapide et entièrement anonyme.
      </p>
      <div className="space-x-4">
        <a
          href={(window as any).ENV_CONFIG?.VITE_THREAD_URL || "http://localhost"}
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
        >
          Voir tous les messages
        </a>
        <Link
          to="/message"
          className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 transition"
        >
          Poster un message
        </Link>
      </div>
    </main>

    {/* Footer */}
    <footer className="bg-white shadow-inner">
      <div className="container mx-auto px-6 py-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Forum Anonyme. Tous droits réservés.
      </div>
    </footer>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/status" element={<Status />} />
        <Route path="/message" element={<MessageForm />} />
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <h1 className="text-3xl font-bold text-gray-700">404 - Page non trouvée</h1>
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App;
