import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../navbar/NavBar.module.css';
import LOGO from '../../../img/logo.png';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    // Aquí iría la lógica de deslogueo
    console.log("Deslogueado exitosamente");
    navigate('/'); // Redirigir al login después de desloguearse
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">
          <img src={LOGO} alt="Logo" />
        </Link>
      </div>
      <div className={`${styles.links} ${isOpen ? styles.open : ''}`}>
        <Link to="/stock" onClick={toggleMenu}>STOCK</Link>
        <Link to="/envios" onClick={toggleMenu}>SALIDA</Link>
        <Link to="/reportes" onClick={toggleMenu}>REPORTES</Link>
        <Link to="/" onClick={() => { handleLogout(); toggleMenu(); }}>CERRAR SESIÓN</Link>
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
