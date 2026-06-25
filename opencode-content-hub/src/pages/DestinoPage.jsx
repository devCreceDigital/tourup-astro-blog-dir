import { useParams, Link } from 'react-router-dom';
import { destinos, getDestinoBySlug, getToursByDestino } from '../data';
import Breadcrumb from '../components/Breadcrumb';
import FAQAccordion from '../components/FAQAccordion';
import BookingSidebar from '../components/BookingSidebar';
import BudgetTable from '../components/BudgetTable';
import SchemaOrg from '../components/SchemaOrg';
import TourCard from '../components/TourCard';

export default function DestinoPage() {
  const { destino } = useParams();
  const data = getDestinoBySlug(destino);

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="mb-4">Destino no encontrado</h1>
        <p className="text-text-secondary">El destino que buscas no existe.</p>
        <Link to="/" className="btn-primary mt-4 inline-block">Volver al inicio</Link>
      </div>
    );
  }

  const destinationTours = getToursByDestino(data.slug);
  const breadcrumbItems = [
    { label: 'Perú', path: '/' },
    ...(data.parent ? [{ label: 'Perú', path: '/peru/' }] : []),
    { label: data.nombre, path: `/peru/${data.slug}/` },
  ];
  if (!data.parent) {
    breadcrumbItems.splice(1, 1);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SchemaOrg type="FAQPage" data={{ faq: data.faq }} />
      <SchemaOrg type="TouristDestination" data={{
        name: data.nombre,
        description: data.resumen,
        url: `https://perutours.com/peru/${data.slug}/`,
        touristType: 'Turista',
        latitude: data.slug === 'cusco' ? -13.532 : data.slug === 'lima' ? -12.0464 : data.slug === 'arequipa' ? -16.409 : data.slug === 'puno' ? -15.8402 : data.slug === 'iquitos' ? -3.7491 : data.slug === 'machu-picchu' ? -13.1631 : -9.19,
        longitude: data.slug === 'cusco' ? -71.9675 : data.slug === 'lima' ? -77.0428 : data.slug === 'arequipa' ? -71.5375 : data.slug === 'puno' ? -70.0219 : data.slug === 'iquitos' ? -73.2538 : data.slug === 'machu-picchu' ? -72.545 : -75.0152,
      }} />

      <Breadcrumb items={breadcrumbItems} />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <h1 className="mb-6">{data.h1}</h1>

          <section className="mb-8">
            <h2 className="mb-3">Resumen rápido: por qué viajar a {data.nombre}</h2>
            <p>{data.resumen}</p>
            <p className="mt-2">Es el destino ideal para viajeros que buscan {data.slug === 'cusco' ? 'historia, arqueología y cultura andina. Desde aquí parten todas las rutas hacia Machu Picchu, el Valle Sagrado y el Camino Inca.' : data.slug === 'lima' ? 'gastronomía, arte e historia. Es la puerta de entrada al 90% de los viajeros que llegan a Perú.' : data.slug === 'arequipa' ? 'arquitectura colonial, naturaleza extrema y gastronomía de altura.' : data.slug === 'puno' ? 'culturas vivas, experiencias comunitarias y paisajes de alta montaña.' : data.slug === 'iquitos' ? 'naturaleza, observación de fauna y desconexión total.' : data.slug === 'machu-picchu' ? 'historia precolombina, arqueología y fotografía de paisajes.' : 'aventura, cultura y naturaleza en un solo destino.'}</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3">Cuándo es la mejor época para visitar {data.nombre}</h2>
            <h3 className="mb-2 mt-4">Temporada alta, media y baja</h3>
            <p><strong>Temporada alta:</strong> {data.temporadas.alta}</p>
            <p className="mt-1"><strong>Temporada media:</strong> {data.temporadas.media}</p>
            <p className="mt-1"><strong>Temporada baja:</strong> {data.temporadas.baja}</p>
            <h3 className="mb-2 mt-4">Clima por meses y recomendaciones de equipaje</h3>
            <p>{data.slug === 'cusco' ? 'Cusco tiene clima seco y templado. Temperaturas diurnas de 18-22 °C, noches frías de 0-8 °C. Lleva ropa en capas, chaqueta impermeable, zapatos de caminata, protector solar y lentes de sol.' : data.slug === 'lima' ? 'Lima tiene clima subtropical desértico. En verano (26-28 °C) lleva ropa ligera. En invierno (15-20 °C) lleva chaqueta. Siempre ten un impermeable a mano.' : data.slug === 'arequipa' ? 'Arequipa tiene clima templado y seco. Temperaturas de 20-25 °C todo el año. Noches frías de mayo a septiembre (8-12 °C).' : data.slug === 'puno' ? 'Puno tiene clima frío y seco. Días de 15-18 °C, noches bajo 0 °C de mayo a agosto. Lleva ropa térmica, gorro y guantes.' : data.slug === 'iquitos' ? 'Clima cálido y húmedo todo el año (28-33 °C, humedad 80-90%). Lleva ropa ligera de secado rápido, repelente de insectos y protector solar.' : data.slug === 'machu-picchu' ? 'Machu Picchu tiene clima subtropical (12-22 °C). Lleva ropa ligera, impermeable, zapatos con buen agarre y linterna frontal.' : 'Consulta nuestra guía específica para más detalles.'}</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3">Qué ver y hacer en {data.nombre}</h2>
            <h3 className="mb-2 mt-4">Imprescindibles</h3>
            <p>{data.slug === 'cusco' ? 'La Plaza de Armas, Qoricancha (Templo del Sol), Sacsayhuamán, el barrio de San Blas y el Mercado de San Pedro.' : data.slug === 'lima' ? 'El Centro Histórico, Miraflores con el Malecón, Barranco con sus murales, el Museo Larco y Huaca Pucllana.' : data.slug === 'arequipa' ? 'La Plaza de Armas, el Monasterio de Santa Catalina, el Mirador de Carmen Alto y el Museo Santuarios Andinos (momia Juanita).' : data.slug === 'puno' ? 'El Lago Titicaca, las Islas Flotantes de los Uros, la Isla Taquile y la Isla Amantaní.' : data.slug === 'iquitos' ? 'El malecón Tarapacá, la Plaza de Armas con la Catedral de Eiffel, el barrio de Belén y los lodges amazónicos.' : data.slug === 'machu-picchu' ? 'La Plaza Principal, el Templo del Sol, la Intihuatana, el Templo de las 3 Ventanas y la Puerta del Sol.' : 'Explora nuestros destinos para más información.'}</p>
            <h3 className="mb-2 mt-4">Excursiones cercanas</h3>
            <p>{data.slug === 'cusco' ? 'El Valle Sagrado (Pisac, Ollantaytambo, Moray, Maras), la Montaña de 7 Colores, la Laguna Humantay y el Camino Inca.' : data.slug === 'lima' ? 'Paracas y las Islas Ballestas, Huacachina, las Líneas de Nazca, los viñedos de Ica y Pachacámac.' : data.slug === 'arequipa' ? 'El Cañón del Colca (2 días), el Valle de los Volcanes, el Cañón de Cotahuasi y las aguas termales de la Calera.' : data.slug === 'puno' ? 'Sillustani (chullpas funerarias) y la ruta hacia Copacabana en Bolivia.' : data.slug === 'iquitos' ? 'La Reserva Nacional Allpahuayo Mishana, la Reserva Pacaya Samiria y comunidades ribereñas.' : data.slug === 'machu-picchu' ? 'Huayna Picchu, Montaña Machu Picchu, el Puente Inca y Aguas Calientes.' : 'Consulta los tours disponibles para este destino.'}</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3">Cuántos días necesitas en {data.nombre}</h2>
            <h3 className="mb-2 mt-4">Escala rápida (2-3 días)</h3>
            <p>{data.slug === 'cusco' ? 'Día 1: aclimatación y city tour. Día 2: Valle Sagrado exprés. Día 3: Machu Picchu full day.' : data.slug === 'lima' ? 'Día 1: Centro Histórico y Miraflores. Día 2: tour gastronómico o museos.' : 'Mínimo 2-3 días para conocer lo esencial.'}</p>
            <h3 className="mb-2 mt-4">Viaje clásico (4-5 días)</h3>
            <p>{data.slug === 'cusco' ? 'Incluye aclimatación, Valle Sagrado completo, Machu Picchu y día libre para Montaña 7 Colores.' : data.slug === 'lima' ? 'Añade excursión a Paracas o tour gastronómico completo.' : 'Tiempo ideal para una experiencia completa.'}</p>
            <h3 className="mb-2 mt-4">Itinerario extendido (6-8 días)</h3>
            <p>{data.slug === 'cusco' ? 'Añade el Camino Inca (4 días), Salkantay o la ruta de la montaña.' : data.slug === 'lima' ? 'Añade Huacachina, Ica y Nazca en 2-3 días adicionales.' : 'Combínalo con destinos cercanos para una experiencia regional completa.'}</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3">Presupuesto orientativo para viajar a {data.nombre}</h2>
            <h3 className="mb-3">Ejemplo de presupuesto por persona por día</h3>
            <BudgetTable presupuesto={data.presupuesto} />
          </section>

          <section className="mb-8">
            <h2 className="mb-3">Consejos de altura, seguridad y salud</h2>
            <h3 className="mb-2 mt-4">Mal de altura: síntomas y cómo prevenirlo</h3>
            <p>{data.slug === 'cusco' || data.slug === 'puno' || data.slug === 'arequipa' ? `${data.nombre} está a ${data.altitud}. El mal de altura (soroche) se manifiesta con dolor de cabeza, fatiga, náuseas e insomnio. Para prevenirlo: evita actividad extenuante el primer día, toma mate de coca, hidrátate bien y evita comidas pesadas y alcohol.` : `${data.nombre} está a ${data.altitud}. No hay riesgo significativo de mal de altura.`}</p>
            <h3 className="mb-2 mt-4">Zonas seguras y recomendaciones</h3>
            <p>Las zonas turísticas son seguras durante el día. Usa taxis de aplicación, evita exhibir objetos de valor y contrata solo guías certificados. En general, el centro histórico es caminable con precaución.</p>
          </section>

          {destinationTours.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3">Mejores tours y experiencias en {data.nombre}</h2>
              <p className="mb-4">Descubre nuestra selección de tours recomendados por expertos locales para tu visita a {data.nombre}.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {destinationTours.slice(0, 4).map((tour) => (
                  <TourCard key={tour.slug} tour={tour} />
                ))}
              </div>
              <Link to={`/peru/${data.slug}/tours/`} className="btn-outline">
                Ver todos los tours en {data.nombre}
              </Link>
            </section>
          )}

          <section className="mb-8">
            <h2 className="mb-3">Preguntas frecuentes sobre viajar a {data.nombre}</h2>
            <FAQAccordion items={data.faq} />
          </section>
        </div>

        <div className="w-full lg:w-[300px] flex-shrink-0">
          <BookingSidebar destino={data} />
        </div>
      </div>
    </div>
  );
}
