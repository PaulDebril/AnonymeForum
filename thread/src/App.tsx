import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MessageList from './components/MessageList';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MessageList />} />
    </Routes>
  );
};

export default App;
