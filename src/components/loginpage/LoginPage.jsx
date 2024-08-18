import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import logo from '../../../img/logo.png'; 

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const isAuthenticated = onLogin(email, password);

    if (isAuthenticated) {
      navigate('/stock');
    } else {
      alert('Credenciales incorrectas');
    }
  };

  const handlePedirInsumos = () => {
    navigate('/pedidos');
  };

  return (
    <div className={styles.loginContainer}>
      <img src={logo} alt="Imagen de la Empresa" className={styles.logo} />
      <h1 className={styles.title}>Gestión de Insumos</h1>
      <form className={styles.loginForm} onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Iniciar Sesión</button>
      </form>
      <button className={styles.pedirInsumosButton} onClick={handlePedirInsumos}>
        Pedir Insumos
      </button>
    </div>
  );
};

export default LoginPage;
