import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignInSide from './Acces/SignInSide';
import Dashboard from './components/layout/Dashboard';
import Productos from './components/productos/productos';
import Pedidos from './components/surtido/Pedidos';
import ProtectedRoute from './routes/protectedRoute '; // Importa el nuevo componente

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<SignInSide />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
          <Route path="productos" element={<ProtectedRoute><Productos /></ProtectedRoute>} />
          <Route path="pedidos" element={<ProtectedRoute><Pedidos /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
