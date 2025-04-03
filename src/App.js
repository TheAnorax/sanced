// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignInSide from './Acces/SignInSide';
import Dashboard from './components/layout/Dashboard';
import Productos from './components/productos/productos';
import Pedidos from './components/surtido/Pedidos';
import ProtectedRoute from './routes/protectedRoute '; // Importa el nuevo componente
import EnSurtido from './components/surtido/enSurtido';
import PedidoSurtido from './components/pedidos/pedidosSurtidos';
import Paqueteria from './components/paqueteria/paqueteria';
import Finalizados from './components/pedidos/pedidosFinalizados';
import Plan from './components/plan/plan';
import Bahias from './components/bahias/bahias';
import Empaquetando from './components/paqueteria/empaquetando'
import Ubicaciones from './components/ubicaciones/ubis';
import Compras from './components/compras/compras';
import Recibo from './components/recibo/recibo'
import Embarques from './components/embarques/embarques'
import Usuarios from './components/usuarios/usuarios'
import  {UserProvider }  from './components/context/UserContext'
import Calidad from './components/calidad/calidad'
import Inventarios from './components/inventarios/inventarios'
import Reporter from './components/reporte/reporterecibo'
import Insumos from './components/insumos/insumos'
import Embarcando  from './components/embarques/embarcando';
import Inventario from './components/inventory/inventory';
import Muestras from './components/Muestras/Muestras';
import Historial from './components/Historial/Historial';
import Devs from './components/devs/tareas'
import RH from './components/RH/insumos_rh'
import Queretaro from './components/Proyecto/ProyectoQueretaro';
import Visitantes from './components/visitas/visitantes';
import VisitasReporte from './components/visitas/visitasReporte';
import Trasporte from './components/Transporte/Transporte';
import KPi from './components/reporte/kpi'
import Tracking from './components/ventas/ventas';
import Plansurtido from './components/Transporte/plan';
import Mapa from './components/reporte/mapa';

function App() {
  return (        
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<SignInSide />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route path="productos" element={<ProtectedRoute><Productos /></ProtectedRoute>} />
            <Route path="pedidos" element={<ProtectedRoute><Pedidos /></ProtectedRoute>} />
            <Route path="surtido" element={<ProtectedRoute><EnSurtido /></ProtectedRoute>} />
            <Route path="pedidos-surtido" element={<ProtectedRoute><PedidoSurtido /></ProtectedRoute>} />
            <Route path="paqueteria" element={<ProtectedRoute><Paqueteria /></ProtectedRoute>} />
            <Route path="finalizados" element={<ProtectedRoute><Finalizados /></ProtectedRoute>} />
            <Route path="plan" element={<ProtectedRoute><Plan /></ProtectedRoute>} />
            <Route path="bahias" element={<ProtectedRoute><Bahias /></ProtectedRoute>} />
            <Route path="empaquetando" element={<ProtectedRoute><Empaquetando /></ProtectedRoute > }/>
            <Route path="ubicaciones" element={<ProtectedRoute><Ubicaciones /></ProtectedRoute>}/>
            <Route path="compras" element={<ProtectedRoute><Compras /></ProtectedRoute>}/>
            <Route path="recibo" element={<ProtectedRoute><Recibo /></ProtectedRoute>}/>
            <Route path="embarques" element={<ProtectedRoute><Embarques /></ProtectedRoute>}/>
            <Route path="usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>}/>
            <Route path="calidad" element={<ProtectedRoute><Calidad /></ProtectedRoute>}/>
            <Route path="inventarios" element={<ProtectedRoute><Inventarios /></ProtectedRoute>}/>
            <Route path="reporter" element={<ProtectedRoute><Reporter/></ProtectedRoute>}/>
            <Route path="insumos" element={<ProtectedRoute><Insumos /></ProtectedRoute>}/>
            <Route path="embarcando" element={<ProtectedRoute><Embarcando  /></ProtectedRoute>} />
            <Route path="inventario" element={<ProtectedRoute><Inventario  /></ProtectedRoute>} />
            <Route path="muestras" element={<ProtectedRoute><Muestras  /></ProtectedRoute>} />
            <Route path="Historial" element={<ProtectedRoute><Historial  /></ProtectedRoute>} />
            <Route path="devs" element={<ProtectedRoute><Devs  /></ProtectedRoute>} />
            <Route path="RH" element={<ProtectedRoute><RH  /></ProtectedRoute>} />
            <Route path="Queretaro" element={<ProtectedRoute><Queretaro  /></ProtectedRoute>} />
            <Route path="visitas" element={<ProtectedRoute><Visitantes  /></ProtectedRoute>} />
            <Route path="visitas-reporte" element={<ProtectedRoute><VisitasReporte  /></ProtectedRoute>} />
            <Route path="Trasporte" element={<ProtectedRoute><Trasporte  /></ProtectedRoute>} />
            <Route path="kpi" element={<ProtectedRoute><KPi  /></ProtectedRoute>} />
            <Route path="Tracking" element={<ProtectedRoute><Tracking  /></ProtectedRoute>} />
            <Route path="Plansurtido" element={<ProtectedRoute><Plansurtido /></ProtectedRoute>} />
            <Route path="Mapa" element={<ProtectedRoute><Mapa /></ProtectedRoute>} />

          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
