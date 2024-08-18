import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout';
import { HomePage, StockPage, EnviosPage, ReportsPage, LoginPage, PedidoInsumosPage, BuscarPedidosPage } from './helpers/PathRoutes';

// Componente para proteger rutas
function ProtectedRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/" />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (email, password) => {
    const defaultEmail = 'gamaya@cleanlif.com.ar';
    const defaultPassword = 'clean2024';

    if (email === defaultEmail && password === defaultPassword) {
      setIsAuthenticated(true);
      return true;  // Indica que la autenticación fue exitosa
    } else {
      return false;  // Indica que la autenticación falló
    }
  };

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
          <Route 
            path="/stock" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <StockPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/envios" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <EnviosPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reportes" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ReportsPage />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/buscar-pedidos" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <BuscarPedidosPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/pedidos" element={<PedidoInsumosPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
