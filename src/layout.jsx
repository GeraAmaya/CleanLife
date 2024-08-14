import { useLocation } from 'react-router-dom';
import Navbar from './components/navbar/NavBar';

function Layout({ children }) {
  const location = useLocation();

 return (
    <>
      {/* Oculta la Navbar en la página de inicio y en la página de pedidos */}
      {location.pathname !== '/' && location.pathname !== '/pedidos' && <Navbar />}
      {children}
    </>
  );
}

export default Layout;
