import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layout';
import { HomePage, StockPage, EnviosPage, ReportsPage, LoginPage, PedidoInsumosPage } from './helpers/PathRoutes';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/envios" element={<EnviosPage />} />
          <Route path="/reportes" element={<ReportsPage />} />
          <Route path="/pedidos" element={< PedidoInsumosPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
