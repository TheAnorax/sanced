import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignInSide from './Acces/SignInSide';
import Dashboard from './components/layout/Dashboard';
import Productos from './components/productos/productos';
import Pedidos from './components/surtido/Pedidos';
import ProtectedRoute from './routes/protectedRoute '; // Importa el nuevo componente
import EnSurtido from './components/surtido/enSurtido';
import PedidoSurtido from './components/pedidos/pedidosSurtidos';
import Paquetrai from './components/paqueteria/paqueteria';
import Finalizados from './components/pedidos/pedidosFinalizados';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<SignInSide />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
          <Route path="productos" element={<ProtectedRoute><Productos /></ProtectedRoute>} />
          <Route path="pedidos" element={<ProtectedRoute><Pedidos /></ProtectedRoute>} />
          <Route path="surtido" element={<ProtectedRoute><EnSurtido /></ProtectedRoute>} />
          <Route path="pedidos-surtido" element={<ProtectedRoute><PedidoSurtido /></ProtectedRoute>} />
          <Route path="paqueteria" element={<ProtectedRoute><Paquetrai /></ProtectedRoute>}/>
          <Route path="finalizados" element={<ProtectedRoute><Finalizados/></ProtectedRoute>}/>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
