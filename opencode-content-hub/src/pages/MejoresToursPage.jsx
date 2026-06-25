import { useParams, Link } from 'react-router-dom';
import { tours, getToursByLugar } from '../data';
import Breadcrumb from '../components/Breadcrumb';
import FAQAccordion from '../components/FAQAccordion';
import TourCard from '../components/TourCard';
import SchemaOrg from '../components/SchemaOrg';

export default function MejoresToursPage() {
  const { destino, lugar } = useParams();
  const lugarSlug = lugar?.replace('tours-', '') || 'machu-picchu';
  const lugarNombre = lugarSlug === 'machu-picchu' ? 'Machu Picchu' : lugarSlug;

  const destinationTours = tours.filter(t => t.lugar === lugarNombre);
  const destinoNombre = destino || 'cusco';

  const breadcrumbItems = [
    { label: 'Perú', path: '/' },
    { label: destinoNombre.charAt(0).toUpperCase() + destinoNombre.slice(1), path: `/peru/${destinoNombre}/` },
    { label: `Tours ${lugarNombre}`, path: `/peru/${destinoNombre}/tours-${lugarSlug}/` },
  ];

  const faqItems = [
    { q: `¿Cuántas horas dura un tour full day a ${lugarNombre} desde Cusco?`, r: `Un tour full day a ${lugarNombre} desde Cusco dura aproximadamente 14-16 horas, desde la recogida en el hotel (4:00 am) hasta el regreso (8:00-9:00 pm).` },
    { q: `¿Qué diferencia hay entre un tour grupal y privado a ${lugarNombre}?`, r: 'Los tours grupales son más económicos y compartes la experiencia con otros viajeros. Los tours privados ofrecen atención personalizada, horarios flexibles y guía exclusivo.' },
    { q: '¿Qué incluyen normalmente los tours?', r: 'La mayoría incluye transporte hotel-estación, tren, bus a la ciudadela, guía profesional y entrada. No suelen incluir alimentación, seguros ni propinas.' },
    { q: '¿Puedo cambiar de fecha mi tour si hay huelga o cierre?', r: 'Depende de la política del operador. La mayoría permite reprogramar en caso de fuerza mayor. Es recomendable contratar con operadores que ofrezcan flexibilidad.' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SchemaOrg type="FAQPage" data={{ faq: faqItems }} />
      <SchemaOrg type="ItemList" data={{
        name: `Mejores tours a ${lugarNombre} desde Cusco`,
        description: `Selección de los mejores tours a ${lugarNombre} para todos los presupuestos y estilos de viaje.`,
        items: destinationTours,
      }} />

      <Breadcrumb items={breadcrumbItems} />

      <h1 className="mb-6">Mejores tours a {lugarNombre} desde Cusco (2026)</h1>

      <section className="mb-8">
        <h2 className="mb-3">Resumen rápido: qué tour elegir según tu tipo de viaje</h2>
        <ul className="space-y-2">
          <li><strong>Viaje corto (pocos días):</strong> Full day a Machu Picchu en tren Expedition. Ideal para quienes tienen tiempo limitado pero no quieren perderse la experiencia.</li>
          <li><strong>Viaje clásico (4-5 días):</strong> Combina Valle Sagrado + Machu Picchu full day. La mejor relación tiempo-experiencia.</li>
          <li><strong>Viaje premium / slow:</strong> Tour privado con tren Vistadome o Camino Inca 4 días. Para quienes buscan una experiencia exclusiva o de aventura.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3">Top tours a {lugarNombre} seleccionados por expertos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {destinationTours.map((tour) => (
            <TourCard key={tour.slug} tour={tour} />
          ))}
        </div>
      </section>

      {/* Tabla comparativa */}
      <section className="mb-8 overflow-x-auto">
        <h2 className="mb-3">Tabla comparativa de tours a {lugarNombre}</h2>
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="bg-neutral-bg">
              <th className="text-left p-3 border border-border-color font-semibold">Tour</th>
              <th className="text-left p-3 border border-border-color font-semibold">Duración</th>
              <th className="text-left p-3 border border-border-color font-semibold">Tipo</th>
              <th className="text-left p-3 border border-border-color font-semibold">Precio</th>
              <th className="text-left p-3 border border-border-color font-semibold">Dificultad</th>
            </tr>
          </thead>
          <tbody>
            {destinationTours.map((tour) => (
              <tr key={tour.slug} className="hover:bg-neutral-bg">
                <td className="p-3 border border-border-color font-medium">{tour.nombre}</td>
                <td className="p-3 border border-border-color">{tour.duracion}</td>
                <td className="p-3 border border-border-color">
                  <span className={`${tour.tipo === 'Privado' ? 'badge-private' : 'badge-group'}`}>{tour.tipo}</span>
                </td>
                <td className="p-3 border border-border-color font-semibold text-accent">${tour.precio} USD</td>
                <td className="p-3 border border-border-color">{tour.dificultad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="mb-3">Consejos para elegir el mejor tour a {lugarNombre}</h2>
        <h3 className="mb-2 mt-4">Diferencias entre tour grupal y privado</h3>
        <p>Los tours grupales son más económicos (25-50% menos) e incluyen guía compartido. Los privados ofrecen flexibilidad de horarios, atención personalizada y mejor calidad de servicio. Para grupos grandes o viajeros con necesidades específicas, recomendamos el privado.</p>
        <h3 className="mb-2 mt-4">Trenes, horarios y combinaciones</h3>
        <p>El tren Expedition es la opción estándar. El Vistadome tiene ventanas panorámicas. El Hiram Bingham es la experiencia de lujo con comida a bordo. Puedes combinar el tour con una visita al Valle Sagrado el día anterior para optimizar tiempo.</p>
      </section>

      <section>
        <h2 className="mb-3">Preguntas frecuentes sobre tours a {lugarNombre}</h2>
        <FAQAccordion items={faqItems} />
      </section>
    </div>
  );
}
