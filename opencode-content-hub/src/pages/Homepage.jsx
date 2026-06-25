import { Link } from 'react-router-dom';
import { destinos, getToursByLugar } from '../data';
import TourCard from '../components/TourCard';
import SchemaOrg from '../components/SchemaOrg';

export default function Homepage() {
  const destacados = destinos.filter(d => d.tipo === 'destino').slice(0, 3);
  const featuredTours = ['machu-picchu-full-day', 'valle-sagrado-full-day', 'colca-canyon-2-dias']
    .map(slug => getToursByLugar('Machu Picchu').concat(getToursByLugar('Valle Sagrado')).concat(getToursByLugar('Colca')).find(t => t.slug === slug))
    .filter(Boolean);
  const faqItems = destinos.find(d => d.slug === 'peru').faq.slice(0, 4);

  return (
    <div>
      <SchemaOrg type="FAQPage" data={{ faq: faqItems }} />

      {/* Hero */}
      <section className="bg-primary-dark text-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-[32px] md:text-[42px] font-bold mb-4 leading-tight">
            Descubre Perú: tu guía completa de viaje
          </h1>
          <p className="text-[16px] md:text-[18px] text-primary-light max-w-2xl mx-auto mb-8">
            Encuentra los mejores tours, itinerarios y destinos para tu viaje a Perú. Información actualizada para planificar la experiencia perfecta.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/peru/cusco/" className="bg-white text-primary-dark font-semibold px-6 py-3 rounded-lg hover:bg-primary-light transition-colors">
              Explorar destinos
            </Link>
            <Link to="/peru/itinerario-10-dias/" className="border-2 border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
              Ver itinerarios
            </Link>
          </div>
        </div>
      </section>

      {/* Destinos destacados */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="mb-6">Destinos destacados</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {destacados.map((destino) => (
            <Link key={destino.slug} to={`/peru/${destino.slug}/`} className="card hover:shadow-md transition-shadow block">
              <div className="w-full h-40 bg-primary-light rounded-lg mb-3 flex items-center justify-center">
                <span className="text-[40px] text-primary font-bold">{destino.nombre[0]}</span>
              </div>
              <h3 className="text-[16px] font-semibold mb-1">{destino.nombre}</h3>
              <p className="text-[13px] text-text-secondary line-clamp-2">{destino.resumen}</p>
              <div className="flex items-center gap-2 mt-3 text-[12px] text-text-muted">
                <span>{destino.mejor_epoca}</span>
                <span>·</span>
                <span>{destino.altitud}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Tours populares */}
      <section className="bg-neutral-bg py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="mb-6">Tours populares en Perú</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredTours.map((tour) => tour && (
              <TourCard key={tour.slug} tour={tour} />
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/peru/cusco/tours/" className="btn-outline">
              Ver todos los tours
            </Link>
          </div>
        </div>
      </section>

      {/* Itinerarios */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="mb-6">Itinerarios recomendados</h2>
        <div className="card bg-primary-light border-primary/20">
          <h3 className="text-[16px] font-semibold mb-2">Itinerario de 10 días por Perú</h3>
          <p className="text-[14px] text-text-secondary mb-4">Lima, Cusco, Machu Picchu y Lago Titicaca. El clásico del sur peruano.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {['Día 1-2: Lima', 'Día 3-7: Cusco', 'Día 8-9: Puno', 'Día 10: Retorno'].map((item, i) => (
              <span key={i} className="bg-white px-3 py-1 rounded-full text-[12px] font-medium text-text-secondary border border-border-color">{item}</span>
            ))}
          </div>
          <Link to="/peru/itinerario-10-dias/" className="btn-primary">
            Ver itinerario completo
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white py-16 text-center">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-white border-l-white text-[24px] mb-3">¿Listo para planificar tu viaje a Perú?</h2>
          <p className="text-primary-light mb-6 max-w-xl mx-auto">Explora nuestros destinos, compara tours y arma el itinerario perfecto.</p>
          <Link to="/peru/preguntas-frecuentes-viajar-a-peru/" className="bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-primary-light transition-colors">
            Preguntas frecuentes
          </Link>
        </div>
      </section>
    </div>
  );
}
