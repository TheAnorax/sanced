import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const useAuth = () => {
  // Aquí puedes implementar tu lógica de autenticación.
  // Por ejemplo, verificar si hay un token en el localStorage.
  const token = localStorage.getItem('token');
  return !!token; // Devuelve true si el token existe, false en caso contrario.
};

const ProtectedRoute = ({ children }) => {
  const isAuth = useAuth();

  if (!isAuth) {
    return <Navigate to="/login" />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
