import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/NavBar'
import { HomePage, StockPage, EnviosPage, ReportsPage } from './helpers/PathRoutes';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/envios" element={<EnviosPage />} />
        <Route path="/reportes" element={<ReportsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
