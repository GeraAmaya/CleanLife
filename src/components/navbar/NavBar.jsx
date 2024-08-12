import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../navbar/NavBar.module.css';
import LOGO from '../../../img/logo.png'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">
          <img src={LOGO} alt="Logo" />
        </Link>
      </div>
      <div className={`${styles.links} ${isOpen ? styles.open : ''}`}>
        <Link to="/" onClick={toggleMenu}>Inicio</Link>
        <Link to="/stock" onClick={toggleMenu}>Stock</Link>
        <Link to="/envios" onClick={toggleMenu}>Envíos</Link>
        <Link to="/reportes" onClick={toggleMenu}>Reportes</Link>
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
