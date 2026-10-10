/**
 * Itinerarios sostenibles. Las empresas se citan por su ID de certificación en la base
 * TourVerificado (TV-xxxx): la página muestra su estado calculado en cada build, así que un
 * sello que caduca queda marcado sin tocar este archivo. Los reconocimientos de destino salen
 * de la misma base (Green Destinations).
 */
import type { Locale } from '../utils/i18n';

type T = Record<Locale, string>;

export interface ItineraryDay {
  days: T;
  title: T;
  text: T;
  destination?: string;
  certIds?: string[];
  recognition?: string;
}

export interface SustainableItinerary {
  days: number;
  slug: Record<Locale, string>;
  photo: string;
  title: T;
  dek: T;
  route: T;
  plan: ItineraryDay[];
  extension?: ItineraryDay;
}

const CUSCO_OPERATORS = ['TV-0031', 'TV-0036', 'TV-0047', 'TV-0005', 'TV-0029'];
const LIMA_DMCS = ['TV-0051', 'TV-0061', 'TV-0055', 'TV-0053'];

export const SUSTAINABLE_ITINERARIES: SustainableItinerary[] = [
  {
    days: 1,
    slug: { en: '1-day', es: '1-dia' },
    photo: 'sacred-valley',
    title: { en: 'One sustainable day in the Sacred Valley', es: 'Un día sostenible en el Valle Sagrado' },
    dek: {
      en: 'Pisac and Ollantaytambo from Cusco, with a certified operator and an optional night in a certified inn.',
      es: 'Pisac y Ollantaytambo desde Cusco, con un operador certificado y una noche opcional en un alojamiento certificado.',
    },
    route: { en: 'Cusco · Pisac · Ollantaytambo', es: 'Cusco · Pisac · Ollantaytambo' },
    plan: [
      {
        days: { en: 'Morning', es: 'Mañana' },
        title: { en: 'Pisac', es: 'Pisac' },
        text: {
          en: 'The Inca terraces of the Pisac archaeological park and the village market below. Buy crafts directly from the people who make them.',
          es: 'Las terrazas incas del parque arqueológico de Pisac y el mercado del pueblo. Compra la artesanía directamente a quien la hace.',
        },
        destination: 'cusco',
        certIds: CUSCO_OPERATORS,
      },
      {
        days: { en: 'Midday', es: 'Mediodía' },
        title: { en: 'Lunch in the valley', es: 'Almuerzo en el valle' },
        text: {
          en: 'Choose a family-run or community restaurant along the valley road: the spending stays in the valley.',
          es: 'Elige un restaurante familiar o comunitario en la carretera del valle: el gasto se queda en el valle.',
        },
      },
      {
        days: { en: 'Afternoon', es: 'Tarde' },
        title: { en: 'Ollantaytambo', es: 'Ollantaytambo' },
        text: {
          en: 'A living Inca town with its terraces above the square. Trains to Machu Picchu leave from here, so it is also the natural start of a longer trip.',
          es: 'Un pueblo inca habitado, con sus terrazas sobre la plaza. De aquí salen los trenes a Machu Picchu, así que también es el inicio natural de un viaje más largo.',
        },
      },
      {
        days: { en: 'Night (optional)', es: 'Noche (opcional)' },
        title: { en: 'Stay in the valley', es: 'Dormir en el valle' },
        text: {
          en: 'Sleeping in Pisac instead of returning to Cusco saves a road transfer and lets you see the market early the next day.',
          es: 'Dormir en Pisac en lugar de volver a Cusco ahorra un traslado por carretera y permite ver el mercado temprano al día siguiente.',
        },
        certIds: ['TV-0038'],
      },
    ],
  },
  {
    days: 7,
    slug: { en: '7-days', es: '7-dias' },
    photo: 'chachapoyas',
    title: { en: 'Seven sustainable days in northern Peru', es: 'Siete días sostenibles por el norte de Perú' },
    dek: {
      en: 'From the Amazon edge at Tarapoto to Gocta and Kuélap, two places recognised by Green Destinations, sleeping in certified lodges.',
      es: 'Del borde amazónico de Tarapoto a Gocta y Kuélap, dos lugares reconocidos por Green Destinations, durmiendo en lodges certificados.',
    },
    route: { en: 'Lima · Tarapoto · Alto Mayo · Chachapoyas · Gocta · Kuélap · Lima', es: 'Lima · Tarapoto · Alto Mayo · Chachapoyas · Gocta · Kuélap · Lima' },
    plan: [
      {
        days: { en: 'Day 1', es: 'Día 1' },
        title: { en: 'Lima to Tarapoto', es: 'De Lima a Tarapoto' },
        text: {
          en: 'Fly from Lima to Tarapoto, where the Andes drop into the Amazon. Stay by the Huallaga river at Shapaja.',
          es: 'Vuela de Lima a Tarapoto, donde los Andes bajan a la Amazonía. Alojamiento junto al río Huallaga, en Shapaja.',
        },
        destination: 'tarapoto',
        certIds: ['TV-0082'],
      },
      {
        days: { en: 'Day 2', es: 'Día 2' },
        title: { en: 'Forest and river', es: 'Bosque y río' },
        text: {
          en: 'Walk the forest around the lodge and visit Tarapoto. Hire local guides and choose small groups.',
          es: 'Recorre el bosque alrededor del lodge y visita Tarapoto. Contrata guías locales y elige grupos pequeños.',
        },
        destination: 'tarapoto',
      },
      {
        days: { en: 'Day 3', es: 'Día 3' },
        title: { en: 'Road to Chachapoyas through Alto Mayo', es: 'Carretera a Chachapoyas por el Alto Mayo' },
        text: {
          en: 'A long road day climbing from the jungle to the cloud forest, through the Alto Mayo area.',
          es: 'Un día largo de carretera subiendo de la selva al bosque de neblina, por la zona del Alto Mayo.',
        },
        recognition: 'Alto Mayo',
      },
      {
        days: { en: 'Day 4', es: 'Día 4' },
        title: { en: 'Gocta waterfall', es: 'Catarata de Gocta' },
        text: {
          en: 'Hike to Gocta, one of the highest waterfalls in the world, from Cocachimba. Stay in the valley in a certified lodge.',
          es: 'Caminata a Gocta, una de las cataratas más altas del mundo, desde Cocachimba. Alojamiento en el valle, en un lodge certificado.',
        },
        destination: 'chachapoyas',
        certIds: ['TV-0001', 'TV-0002'],
        recognition: 'Kuélap - Gocta',
      },
      {
        days: { en: 'Day 5', es: 'Día 5' },
        title: { en: 'Kuélap', es: 'Kuélap' },
        text: {
          en: 'The walled Chachapoya city of Kuélap, on a ridge above the Utcubamba valley.',
          es: 'La ciudad amurallada chachapoya de Kuélap, sobre una cresta del valle del Utcubamba.',
        },
        destination: 'chachapoyas',
        recognition: 'Kuélap - Gocta',
      },
      {
        days: { en: 'Day 6', es: 'Día 6' },
        title: { en: 'Back towards Lima', es: 'Regreso hacia Lima' },
        text: {
          en: 'Travel by road to the nearest airport with flights to Lima (Jaén or Tarapoto) and fly back.',
          es: 'Viaja por carretera al aeropuerto más cercano con vuelos a Lima (Jaén o Tarapoto) y regresa.',
        },
      },
      {
        days: { en: 'Day 7', es: 'Día 7' },
        title: { en: 'Lima', es: 'Lima' },
        text: {
          en: 'Last day in Lima. Receptive operators certified as B Corporations can organise the whole route.',
          es: 'Último día en Lima. Hay operadores receptivos certificados como Empresa B que pueden organizar toda la ruta.',
        },
        destination: 'lima',
        certIds: ['TV-0055', 'TV-0061'],
      },
    ],
  },
  {
    days: 14,
    slug: { en: '14-days', es: '14-dias' },
    photo: 'colca',
    title: { en: 'Fourteen sustainable days in southern Peru', es: 'Catorce días sostenibles por el sur de Perú' },
    dek: {
      en: 'Cusco, the Sacred Valley and Machu Picchu, then Lake Titicaca and the Colca Canyon, with certified operators and lodges along the way.',
      es: 'Cusco, el Valle Sagrado y Machu Picchu, y después el lago Titicaca y el cañón del Colca, con operadores y alojamientos certificados en el camino.',
    },
    route: { en: 'Lima · Cusco · Sacred Valley · Machu Picchu · Puno · Titicaca · Colca · Arequipa', es: 'Lima · Cusco · Valle Sagrado · Machu Picchu · Puno · Titicaca · Colca · Arequipa' },
    plan: [
      {
        days: { en: 'Day 1', es: 'Día 1' },
        title: { en: 'Lima', es: 'Lima' },
        text: {
          en: 'Arrive in Lima. A certified receptive operator or DMC can organise the whole trip.',
          es: 'Llegada a Lima. Un operador receptivo o DMC certificado puede organizar todo el viaje.',
        },
        destination: 'lima',
        certIds: LIMA_DMCS,
      },
      {
        days: { en: 'Days 2–3', es: 'Días 2–3' },
        title: { en: 'Cusco', es: 'Cusco' },
        text: {
          en: 'Fly to Cusco (3,400 m) and take the first day slowly. Then the historic centre with a certified operator.',
          es: 'Vuela a Cusco (3.400 m) y tómate el primer día con calma. Después, el centro histórico con un operador certificado.',
        },
        destination: 'cusco',
        certIds: CUSCO_OPERATORS,
      },
      {
        days: { en: 'Days 4–5', es: 'Días 4–5' },
        title: { en: 'Sacred Valley', es: 'Valle Sagrado' },
        text: {
          en: 'Pisac, the valley villages and Ollantaytambo, sleeping in the valley.',
          es: 'Pisac, los pueblos del valle y Ollantaytambo, durmiendo en el valle.',
        },
        certIds: ['TV-0038'],
      },
      {
        days: { en: 'Day 6', es: 'Día 6' },
        title: { en: 'Machu Picchu', es: 'Machu Picchu' },
        text: {
          en: 'Train from Ollantaytambo and a guided visit on your ticketed circuit.',
          es: 'Tren desde Ollantaytambo y visita guiada en el circuito de tu entrada.',
        },
        destination: 'machu_picchu',
      },
      {
        days: { en: 'Day 7', es: 'Día 7' },
        title: { en: 'Cusco, active day', es: 'Cusco, día activo' },
        text: {
          en: 'Rest, or a trek or rafting day with adventure operators certified as B Corporations.',
          es: 'Descanso, o un día de trekking o rafting con operadores de aventura certificados como Empresa B.',
        },
        certIds: ['TV-0005', 'TV-0029'],
      },
      {
        days: { en: 'Day 8', es: 'Día 8' },
        title: { en: 'Across the altiplano to Puno', es: 'Por el altiplano hasta Puno' },
        text: {
          en: 'Bus or train from Cusco to Puno (3,827 m) on the shore of Lake Titicaca.',
          es: 'Bus o tren de Cusco a Puno (3.827 m), a orillas del lago Titicaca.',
        },
        destination: 'puno',
      },
      {
        days: { en: 'Days 9–10', es: 'Días 9–10' },
        title: { en: 'Lake Titicaca', es: 'Lago Titicaca' },
        text: {
          en: 'The Uros floating islands and Taquile. Where possible, stay with a community homestay on the lake.',
          es: 'Las islas flotantes de los Uros y Taquile. Si puedes, alójate en una casa comunitaria en el lago.',
        },
        destination: 'puno',
        recognition: 'Lago Titicaca',
      },
      {
        days: { en: 'Day 11', es: 'Día 11' },
        title: { en: 'Puno to the Colca Canyon', es: 'De Puno al cañón del Colca' },
        text: {
          en: 'A high-altitude road day to the Colca valley.',
          es: 'Un día de carretera en altura hasta el valle del Colca.',
        },
      },
      {
        days: { en: 'Days 12–13', es: 'Días 12–13' },
        title: { en: 'Colca Canyon', es: 'Cañón del Colca' },
        text: {
          en: 'Condors, pre-Inca terraces and hot springs, staying in a certified lodge in the valley.',
          es: 'Cóndores, terrazas preincas y aguas termales, en un alojamiento certificado del valle.',
        },
        destination: 'colca',
        certIds: ['TV-0003'],
        recognition: 'Cañón del Colca',
      },
      {
        days: { en: 'Day 14', es: 'Día 14' },
        title: { en: 'Arequipa and home', es: 'Arequipa y regreso' },
        text: {
          en: 'Drive down to Arequipa, the White City, and fly out.',
          es: 'Baja a Arequipa, la Ciudad Blanca, y vuelo de regreso.',
        },
        destination: 'arequipa',
      },
    ],
    extension: {
      days: { en: 'Extension', es: 'Extensión' },
      title: { en: 'Manu cloud forest', es: 'Bosque de neblina del Manu' },
      text: {
        en: 'Add two or three days in the cloud forest of Kosñipata, in the buffer zone of Manu, from Cusco.',
        es: 'Suma dos o tres días en el bosque de neblina de Kosñipata, en la zona de amortiguamiento del Manu, desde Cusco.',
      },
      destination: 'manu',
      certIds: ['TV-0023'],
    },
  },
];

export const sustainabilityPath = (lang: Locale) => (lang === 'es' ? '/es/sostenibilidad/' : '/en/sustainability/');
export const sustainableItineraryPath = (lang: Locale, it: SustainableItinerary) => `${sustainabilityPath(lang)}${it.slug[lang]}/`;
