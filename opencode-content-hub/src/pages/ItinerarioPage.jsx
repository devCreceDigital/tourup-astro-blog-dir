import { useParams, Link } from 'react-router-dom';
import { itinerarios, getItinerarioBySlug } from '../data';
import Breadcrumb from '../components/Breadcrumb';
import BudgetTable from '../components/BudgetTable';
import FAQAccordion from '../components/FAQAccordion';
import SchemaOrg from '../components/SchemaOrg';

export default function ItinerarioPage() {
  const { dias } = useParams();
  const data = getItinerarioBySlug(dias?.replace('-dias', ''));

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="mb-4">Itinerario no encontrado</h1>
        <p className="text-text-secondary">El itinerario que buscas no está disponible.</p>
        <Link to="/" className="btn-primary mt-4 inline-block">Volver al inicio</Link>
      </div>
    );
  }

  const faqItems = [
    { q: '¿Este itinerario es adecuado para viajeros primerizos?', r: 'Sí, está diseñado para viajeros que visitan Perú por primera vez. Incluye tiempos de aclimatación y actividades balanceadas.' },
    { q: '¿Se puede modificar el orden de los días?', r: 'Sí, el itinerario es flexible. Recomendamos mantener el orden sugerido por temas de aclimatación y logística de vuelos.' },
    { q: '¿Qué nivel de condición física requiere?', r: 'Nivel medio. Incluye caminatas moderadas en Cusco y Machu Picchu. Días 6 y 7 requieren mayor esfuerzo físico.' },
    { q: '¿Cuánto cuesta este itinerario?', r: 'Depende del nivel: económico 800-1000 USD, estándar 1200-1800 USD, premium 2500-4000 USD por persona.' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SchemaOrg type="FAQPage" data={{ faq: faqItems }} />

      <Breadcrumb items={[
        { label: 'Perú', path: '/' },
        { label: data.titulo, path: `/peru/itinerario-${dias}/` },
      ]} />

      <h1 className="mb-6">{data.titulo}</h1>

      <section className="mb-8">
        <h2 className="mb-3">Resumen rápido: para quién es este itinerario</h2>
        <p>{data.descripcion}</p>
        <p className="mt-2">Ideal para viajeros que disponen de 10 días y quieren conocer lo mejor del sur de Perú sin prisas pero aprovechando al máximo el tiempo.</p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3">Día a día</h2>
        <div className="space-y-4">
          {data.dias.map((item) => (
            <div key={item.dia} className="card border-l-4 border-primary">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-primary text-white text-[12px] font-bold px-2 py-0.5 rounded">DÍA {item.dia}</span>
                <h3 className="text-[15px] font-semibold mb-0 border-none pl-0">{item.titulo}</h3>
              </div>
              <p className="mb-2">{item.descripcion}</p>
              <div className="flex flex-wrap gap-3 text-[12px] text-text-muted">
                <span>🍽️ {item.comida}</span>
                <span>🏨 {item.hospedaje}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3">Presupuesto estimado por persona</h2>
        <BudgetTable presupuesto={data.presupuesto} />
      </section>

      <section className="mb-8">
        <h2 className="mb-3">Variantes posibles</h2>
        <ul className="space-y-1">
          {data.variantes.map((v, i) => (
            <li key={i}>{v}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3">Preguntas frecuentes sobre itinerarios en Perú</h2>
        <FAQAccordion items={faqItems} />
      </section>
    </div>
  );
}
