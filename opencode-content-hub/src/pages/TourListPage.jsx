import { useParams, Link } from 'react-router-dom';
import { destinos, getDestinoBySlug, getToursByDestino } from '../data';
import Breadcrumb from '../components/Breadcrumb';
import TourCard from '../components/TourCard';
import SchemaOrg from '../components/SchemaOrg';

export default function TourListPage() {
  const { destino } = useParams();
  const data = getDestinoBySlug(destino);
  const destinationTours = getToursByDestino(destino);

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="mb-4">Destino no encontrado</h1>
        <Link to="/" className="btn-primary inline-block">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumb items={[
        { label: 'Perú', path: '/' },
        { label: data.nombre, path: `/peru/${data.slug}/` },
        { label: 'Tours', path: `/peru/${data.slug}/tours/` },
      ]} />

      <h1 className="mb-6">Tours en {data.nombre}: encuentra la experiencia perfecta</h1>

      <p className="mb-6">Descubre nuestra selección de tours y experiencias en {data.nombre}. Todos los operadores están verificados y certificados.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {destinationTours.map((tour) => (
          <TourCard key={tour.slug} tour={tour} />
        ))}
      </div>

      {destinationTours.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-text-secondary">No hay tours disponibles para este destino actualmente.</p>
        </div>
      )}
    </div>
  );
}
