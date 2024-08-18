import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from '../navbar/NavBar.module.css';
import LOGO from '../../../img/logo.png';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    console.log("Deslogueado exitosamente");
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">
          <img src={LOGO} alt="Logo" />
        </Link>
      </div>
      <div className={`${styles.links} ${isOpen ? styles.open : ''}`}>
        <Link
          to="/stock"
          onClick={toggleMenu}
          className={location.pathname.startsWith('/stock') ? styles.active : ''}
        >
          STOCK
        </Link>
        <Link
          to="/envios"
          onClick={toggleMenu}
          className={location.pathname.startsWith('/envios') ? styles.active : ''}
        >
          SALIDA
        </Link>
        <Link
          to="/reportes"
          onClick={toggleMenu}
          className={location.pathname.startsWith('/reportes') ? styles.active : ''}
        >
          REPORTES ENVIOS
        </Link>
        <Link
          to="/buscar-pedidos"
          onClick={toggleMenu}
          className={location.pathname.startsWith('/buscar-pedidos') ? styles.active : ''}
        >
          REPORTES PEDIDOS
        </Link>
        <Link
          to="/"
          onClick={() => {
            handleLogout();
            toggleMenu();
          }}
          className={location.pathname === '/' ? styles.active : ''}
        >
          CERRAR SESIÓN
        </Link>
      </div>
      <div className={styles.hamburger} onClick={toggleMenu}>
        <div className={styles.line}></div>
        <div className={styles.line}></div>
        <div className={styles.line}></div>
      </div>
    </nav>
  );
}

export default Navbar;
