import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Homepage from './pages/Homepage';
import DestinoPage from './pages/DestinoPage';
import TourListPage from './pages/TourListPage';
import MejoresToursPage from './pages/MejoresToursPage';
import ItinerarioPage from './pages/ItinerarioPage';
import FAQsPage from './pages/FAQsPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/peru/:destino/" element={<DestinoPage />} />
        <Route path="/peru/:destino/tours/" element={<TourListPage />} />
        <Route path="/peru/:destino/tours-:lugar/" element={<MejoresToursPage />} />
        <Route path="/peru/itinerario-:dias-dias/" element={<ItinerarioPage />} />
        <Route path="/peru/preguntas-frecuentes-viajar-a-peru/" element={<FAQsPage />} />
      </Routes>
    </Layout>
  );
}
