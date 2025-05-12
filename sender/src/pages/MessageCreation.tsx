import React, { useEffect, useState } from 'react';

const Status: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<string>('⏳ Chargement...');
  const [dbStatus, setDbStatus] = useState<string>('⏳ Chargement...');

  useEffect(() => {
    fetch('http://localhost:3000/hello')
      .then(res => {
        if (res.ok) {
          setApiStatus('✅ OK');
        } else {
          setApiStatus('❌ Erreur');
        }
      })
      .catch(() => setApiStatus('❌ Erreur'));

    fetch('http://localhost:3000/health')
      .then(res => {
        if (res.ok) {
          setDbStatus('✅ OK');
        } else {
          setDbStatus('❌ Erreur');
        }
      })
      .catch(() => setDbStatus('❌ Erreur'));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>État des services</h1>
      <p>État du back : {apiStatus}</p>
      <p>État de la BDD : {dbStatus}</p>
    </div>
  );
};

export default Status;
