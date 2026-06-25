import { Link } from 'react-router-dom';
import { destinos } from '../data';
import Breadcrumb from '../components/Breadcrumb';
import FAQAccordion from '../components/FAQAccordion';
import SchemaOrg from '../components/SchemaOrg';

export default function FAQsPage() {
  const peruFAQ = destinos.find(d => d.slug === 'peru').faq;

  const faqGroups = [
    {
      titulo: 'Visados y vacunas',
      items: [
        { q: '¿Necesito visa para viajar a Perú?', r: 'Los ciudadanos de EE.UU., Canadá, Reino Unido, Australia, Nueva Zelanda y la mayoría de países europeos no necesitan visa para estancias de hasta 183 días.' },
        { q: '¿Qué vacunas son obligatorias para Perú?', r: 'No hay vacunas obligatorias, excepto la fiebre amarilla si vienes de un país endémico. Se recomienda hepatitis A, tétanos y fiebre tifoidea.' },
        { q: '¿Necesito pasaporte con cuánto tiempo de vigencia?', r: 'Se recomienda que el pasaporte tenga al menos 6 meses de vigencia desde la fecha de ingreso a Perú.' },
        { q: '¿Puedo extender mi estadía turística en Perú?', r: 'Sí, puedes solicitar una extensión en Migraciones por 30 días adicionales. El costo aproximado es de 100 soles.' },
      ]
    },
    {
      titulo: 'Seguridad',
      items: [
        { q: '¿Perú es seguro para turistas?', r: 'Las zonas turísticas de Lima, Cusco, Arequipa y el Valle Sagrado son seguras. Toma precauciones básicas como en cualquier destino internacional.' },
        { q: '¿Qué zonas debo evitar?', r: 'Evita zonas no turísticas de noche, especialmente en Lima (Callao, Ciudad de Dios) y barrios periféricos de ciudades grandes.' },
        { q: '¿Es seguro el transporte público?', r: 'Los taxis de aplicación (Uber, Cabify) son seguros. Evita taxis no identificados en la calle. Las combis no son recomendables para turistas.' },
        { q: '¿Hay estafas comunes a turistas?', r: 'Las más frecuentes son: taxis no autorizados, cambio de moneda en la calle y tours sin licencia. Contrata solo servicios verificados.' },
      ]
    },
    {
      titulo: 'Dinero y pagos',
      items: [
        { q: '¿Qué moneda se usa en Perú?', r: 'El sol peruano (PEN). El tipo de cambio aproximado es 3.70 soles por USD.' },
        { q: '¿Aceptan tarjetas de crédito?', r: 'Visa y Mastercard se aceptan en hoteles, restaurantes y tiendas de ciudades. Lleva efectivo para mercados, taxis y pueblos pequeños.' },
        { q: '¿Debo llevar dólares o soles?', r: 'Ambos. Los dólares se aceptan en algunas agencias y tours. Los soles son necesarios para gastos diarios. Cambia en casas de cambio autorizadas.' },
        { q: '¿Hay cajeros automáticos disponibles?', r: 'Sí, en todas las ciudades hay cajeros. La comisión por retiro es de aproximadamente 10-15 soles por transacción.' },
      ]
    },
    {
      titulo: 'Propinas',
      items: [
        { q: '¿Es obligatorio dejar propina en Perú?', r: 'No es obligatorio, pero es habitual dejar 10% en restaurantes de gama media-alta y 5-10 soles para guías de tours.' },
        { q: '¿Cuánto se deja de propina a los guías?', r: 'Para guías de tours grupales: 10-15 soles por día. Para guías privados: 20-30 soles por día.' },
      ]
    },
    {
      titulo: 'Seguro de viaje',
      items: [
        { q: '¿Es obligatorio el seguro de viaje para Perú?', r: 'No es obligatorio, pero es altamente recomendable. Una emergencia médica puede costar entre 500 y 3000 USD.' },
        { q: '¿Qué debe cubrir mi seguro de viaje?', r: 'Recomendamos que cubra: gastos médicos (mínimo 50,000 USD), evacuación, cancelación de viaje y pérdida de equipaje.' },
      ]
    }
  ];

  const allFaqItems = faqGroups.flatMap(g => g.items);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SchemaOrg type="FAQPage" data={{ faq: [...peruFAQ, ...allFaqItems] }} />

      <Breadcrumb items={[
        { label: 'Perú', path: '/' },
        { label: 'Preguntas frecuentes', path: '/peru/preguntas-frecuentes-viajar-a-peru/' },
      ]} />

      <h1 className="mb-6">Preguntas frecuentes sobre viajar a Perú</h1>

      <p className="mb-8">Todo lo que necesitas saber antes de viajar a Perú: requisitos de entrada, seguridad, dinero, propinas y seguro de viaje.</p>

      {faqGroups.map((group) => (
        <section key={group.titulo} className="mb-8">
          <h2 className="mb-3">{group.titulo}</h2>
          <FAQAccordion items={group.items} />
        </section>
      ))}
    </div>
  );
}
