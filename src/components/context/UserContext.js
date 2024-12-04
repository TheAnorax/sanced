import React, { createContext, useState, useEffect } from 'react';

// Crear el contexto del usuario
export const UserContext = createContext();

// Proveedor del contexto del usuario
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Efecto para cargar el usuario desde localStorage cuando se carga la aplicación
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Escuchar cambios en localStorage (para casos donde el usuario cambia en otras pestañas)
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        setUser(JSON.parse(updatedUser)); // Actualiza el usuario si hay cambios en localStorage
      } else {
        setUser(null); // Si no hay usuario en localStorage, limpia el estado
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Limpia el evento al desmontar el componente
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Función para manejar el inicio de sesión
  const login = (newUser) => {
    setUser(newUser); // Actualiza el estado del contexto
    localStorage.setItem('user', JSON.stringify(newUser)); // Guarda el usuario en localStorage
    localStorage.setItem('token', newUser.token); // Guarda el token en localStorage
  };

  // Función para manejar el cierre de sesión
  const logout = () => {
    setUser(null); // Limpia el estado del contexto
    localStorage.removeItem('user'); // Limpia el usuario en localStorage
    localStorage.removeItem('token'); // Limpia el token en localStorage
    localStorage.removeItem('role'); // Limpia el rol en localStorage si lo tienes
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
