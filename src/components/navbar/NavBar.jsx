import { Link } from 'react-router-dom';
import styles from '../navbar/NavBar.module.css';

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link to="/">Inicio</Link>
      <Link to="/stock">Stock</Link>
      <Link to="/envios">Envíos</Link>
      <Link to="/reportes">Reportes</Link>
    </nav>
  );
}

export default Navbar;
