import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { fetchHello } from './services/api';
import './App.css';

function App() {
  const [count, setCount] = useState<number>(0);
  const [message, setMessage] = useState<string>('Chargement…');

  useEffect(() => {
    fetchHello()
      .then(res => setMessage(res.message))
      .catch(() => setMessage('Impossible de contacter l’API'));
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Service SENDER</h1>

      <div className="api-response">
        Réponse de <code>/hello</code> : <strong>{message}</strong>
      </div>

      <div className="card">
        <button onClick={() => setCount(c => c + 1)}>
          count is {count}
        </button>
        <p>
          Éditez <code>src/App.tsx</code> et sauvegardez pour tester le HMR
        </p>
      </div>

      <p className="read-the-docs">
        Cliquez sur les logos Vite et React pour en savoir plus
      </p>
    </>
  );
}

export default App;
