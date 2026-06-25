export const destinos = [
  {
    slug: 'peru',
    nombre: 'Perú',
    h1: 'Viajar a Perú: guía completa para planificar tu viaje',
    resumen: 'Perú es el país de los 84 de los 117 pisos ecológicos del planeta. Aquí nacieron imperios, se cocina con técnicas milenarias y cada valle guarda un secreto distinto. Es el único país de Sudamérica que combina costa desértica, sierra andina y selva amazónica en un solo día de viaje.',
    tipo: 'pais',
    temporadas: {
      alta: 'julio-agosto, Semana Santa, Navidad y Año Nuevo. Los precios suben hasta un 30%.',
      media: 'mayo-junio y septiembre-octubre. Buen clima con menos turistas.',
      baja: 'noviembre-abril (excepto festivos). Lluvias en sierra y selva, mejor época para costa norte.'
    },
    presupuesto: {
      economico: '30-50 USD/día',
      estandar: '70-120 USD/día',
      premium: 'desde 200 USD/día'
    },
    altitud: '0-3,400 msnm',
    dificultad: 'Variable según región',
    mejor_epoca: 'Mayo a octubre (sierra)',
    faq: [
      { q: '¿Cuántos días se necesitan para viajar a Perú?', r: 'Lo mínimo recomendable son 7 días para conocer Lima, Cusco y Machu Picchu. Con 10 a 14 días puedes añadir Arequipa, Lago Titicaca o Amazonía.' },
      { q: '¿Cuál es la mejor época para viajar a Perú?', r: 'Depende de la región. La temporada seca en la sierra (mayo a octubre) es ideal para Cusco y Machu Picchu. La costa limeña es agradable de diciembre a abril. La Amazonía tiene clima cálido todo el año.' },
      { q: '¿Se necesita visa para viajar a Perú?', r: 'Los ciudadanos de Estados Unidos, Canadá, Reino Unido, Australia, Nueva Zelanda y la mayoría de países europeos no necesitan visa para estancias turísticas de hasta 183 días.' },
      { q: '¿Es seguro viajar a Perú por cuenta propia?', r: 'Perú es seguro para viajeros que toman precauciones básicas: evitar zonas no turísticas de noche, usar taxis autorizados y no dejar pertenencias visibles.' },
      { q: '¿Qué vacunas necesito para viajar a Perú?', r: 'No se exigen vacunas obligatorias para ingresar a Perú, excepto la fiebre amarilla si vienes de un país endémico. Se recomienda hepatitis A, tétanos y fiebre tifoidea.' },
      { q: '¿Cuánto cuesta viajar a Perú por día?', r: 'Un viajero económico gasta aproximadamente 30-50 USD por día. Nivel estándar: 70-120 USD. Premium: desde 200 USD.' },
      { q: '¿Qué moneda se usa en Perú?', r: 'La moneda oficial es el sol peruano (PEN). En ciudades y restaurantes turísticos aceptan tarjetas Visa y Mastercard. Lleva efectivo para mercados y pueblos pequeños.' }
    ]
  },
  {
    slug: 'cusco',
    nombre: 'Cusco',
    h1: 'Viajar a Cusco: guía completa para planificar tu viaje a Perú',
    resumen: 'Cusco fue la capital del Imperio Inca y hoy es la puerta de entrada a Machu Picchu, el Valle Sagrado y la cultura andina viva. Sus calles de piedra, mercados tradicionales y ruinas arqueológicas la convierten en el destino imprescindible de cualquier viaje a Perú.',
    tipo: 'destino',
    parent: 'peru',
    temporadas: {
      alta: 'mayo a septiembre. Días soleados, cielos despejados, noches frías. Julio y agosto son los meses de máxima afluencia.',
      media: 'abril y octubre-noviembre. Clima aún bueno con menos turistas.',
      baja: 'diciembre a marzo. Época de lluvias. Días soleados alternan con lluvias por la tarde.'
    },
    presupuesto: {
      economico: '25-40 USD/día',
      estandar: '60-100 USD/día',
      premium: 'desde 150 USD/día'
    },
    altitud: '3,400 msnm',
    dificultad: 'Media (requiere aclimatación)',
    mejor_epoca: 'Mayo a septiembre',
    faq: [
      { q: '¿Cuál es la mejor época para visitar Cusco y Machu Picchu?', r: 'La temporada seca de mayo a octubre ofrece días soleados y cielo despejado. Julio y agosto son los más concurridos. La temporada de lluvias (noviembre a marzo) tiene menos turistas pero lluvias frecuentes.' },
      { q: '¿Cuántos días necesito para conocer Cusco y el Valle Sagrado?', r: 'Lo mínimo recomendable son 4 días: 1 para aclimatación, 1 para el Valle Sagrado, 1 para Machu Picchu y 1 de reserva.' },
      { q: '¿Es peligroso el mal de altura en Cusco?', r: 'Cusco está a 3,400 msnm. El mal de altura afecta de forma leve a la mayoría durante las primeras 24-48 horas. Los síntomas desaparecen con hidratación, mate de coca y evitando esfuerzos.' },
      { q: '¿Puedo visitar Machu Picchu por libre o necesito tour?', r: 'Puedes visitar por libre si compras tu entrada online con anticipación. Sin embargo, la mayoría opta por un tour organizado que incluye transporte, guía y entradas.' },
      { q: '¿Qué tan anticipado debo reservar entradas a Machu Picchu?', r: 'En temporada alta las entradas se agotan 3-4 semanas antes. Para Huayna Picchu o Montaña Machu Picchu, reserva 2-3 meses antes.' },
      { q: '¿Es seguro viajar a Cusco por cuenta propia?', r: 'Cusco es seguro para viajeros independientes. El centro histórico es caminable de día y de noche. Usa taxis autorizados y contrata guías certificados.' },
      { q: '¿Qué llevar en la maleta para un viaje a Cusco?', r: 'Ropa en capas para clima variable, zapatos de caminata, impermeable ligero, protector solar, sombrero, lentes de sol y medicamentos básicos.' }
    ]
  },
  {
    slug: 'lima',
    nombre: 'Lima',
    h1: 'Lima, puerta de entrada a Perú: qué hacer antes y después de tu viaje',
    resumen: 'Lima, la capital de Perú, es el principal hub de entrada al país y la capital gastronómica de América Latina. Combina historia colonial, arte contemporáneo, playas sobre el Pacífico y una escena culinaria mundial.',
    tipo: 'destino',
    parent: 'peru',
    temporadas: {
      alta: 'diciembre a abril. Verano austral: días soleados, temperatura de 26-28 °C.',
      media: 'mayo y noviembre. Clima templado con menos turistas.',
      baja: 'junio a octubre. Cielo nublado y garúa. Temperatura 15-20 °C.'
    },
    presupuesto: {
      economico: '25-40 USD/día',
      estandar: '60-100 USD/día',
      premium: 'desde 180 USD/día'
    },
    altitud: '0 msnm (nivel del mar)',
    dificultad: 'Baja',
    mejor_epoca: 'Diciembre a abril',
    faq: [
      { q: '¿Cuántos días se recomiendan para conocer Lima?', r: 'Con 2 días puedes recorrer el Centro Histórico, Miraflores y Barranco. Con 3-4 días añades museos y excursiones a Paracas o Huacachina.' },
      { q: '¿Cuál es la mejor época para visitar Lima?', r: 'De diciembre a abril, cuando el sol predomina y la temperatura alcanza los 26-28 °C.' },
      { q: '¿Qué platos típicos debo probar en Lima?', r: 'Ceviche clásico, lomo saltado, causa limeña, anticuchos, ají de gallina y suspiro limeño.' },
      { q: '¿Es seguro caminar por Lima como turista?', r: 'Los distritos turísticos (Miraflores, Barranco, San Isidro) son seguros durante el día. Usa taxis de aplicación.' },
      { q: '¿Qué barrios son los mejores para alojarse?', r: 'Miraflores es ideal para turistas. Barranco es más bohemio. San Isidro es el distrito corporativo con hoteles de lujo.' }
    ]
  },
  {
    slug: 'arequipa',
    nombre: 'Arequipa',
    h1: 'Viajar a Arequipa: guía completa para planificar tu viaje',
    resumen: 'Arequipa, la Ciudad Blanca, es el segundo destino turístico del Perú. Su centro histórico de sillar volcánico, sus volcanes y el Cañón del Colca la convierten en un destino único.',
    tipo: 'destino',
    parent: 'peru',
    temporadas: {
      alta: 'mayo a octubre. Clima seco y estable, ideal para el Colca.',
      media: 'abril y noviembre. Buen clima con menos turistas.',
      baja: 'diciembre a marzo. Lluvias esporádicas, paisajes más verdes.'
    },
    presupuesto: {
      economico: '25-35 USD/día',
      estandar: '50-80 USD/día',
      premium: 'desde 120 USD/día'
    },
    altitud: '2,335 msnm',
    dificultad: 'Media',
    mejor_epoca: 'Mayo a octubre',
    faq: [
      { q: '¿Cuántos días se recomiendan para visitar Arequipa?', r: 'Mínimo 3 días: 1 para la ciudad, 2 para el Cañón del Colca.' },
      { q: '¿Cuál es la mejor época para visitar el Colca?', r: 'La temporada seca de mayo a octubre es ideal para ver el vuelo del cóndor.' },
      { q: '¿Cómo llegar al Cañón del Colca?', r: 'El tour dura 2 días/1 noche. Incluye transporte, guía y hospedaje. El viaje toma 3-4 horas.' }
    ]
  },
  {
    slug: 'puno',
    nombre: 'Puno',
    h1: 'Viajar a Puno y Lago Titicaca: guía completa',
    resumen: 'Puno es la capital folclórica del Perú y la puerta de entrada al Lago Titicaca, el lago navegable más alto del mundo.',
    tipo: 'destino',
    parent: 'peru',
    temporadas: {
      alta: 'mayo a octubre. Clima seco, cielo despejado, lago en calma.',
      media: 'abril y octubre. Buen clima con menor afluencia.',
      baja: 'noviembre a marzo. Lluvias frecuentes y cielos nublados.'
    },
    presupuesto: {
      economico: '20-35 USD/día',
      estandar: '45-70 USD/día',
      premium: 'desde 100 USD/día'
    },
    altitud: '3,827 msnm',
    dificultad: 'Alta (requiere aclimatación)',
    mejor_epoca: 'Mayo a octubre',
    faq: [
      { q: '¿Cuántos días se necesitan para conocer Puno?', r: 'Mínimo 2 días: 1 para las islas flotantes y Taquile, 1 para la ciudad.' },
      { q: '¿Cómo llegar a Puno desde Cusco?', r: 'Bus turístico de 6-7 horas con paradas en Andahuaylillas, Raqchi y La Raya.' },
      { q: '¿Se puede cruzar a Bolivia desde Puno?', r: 'Sí, desde Puno se puede cruzar a Copacabana en bus o lancha.' }
    ]
  },
  {
    slug: 'iquitos',
    nombre: 'Iquitos',
    h1: 'Viajar a Iquitos y la Amazonía Peruana: guía completa',
    resumen: 'Iquitos es la ciudad más grande de la Amazonía peruana, la mayor del mundo sin acceso por carretera. Puerta de entrada a lodges amazónicos y reservas naturales.',
    tipo: 'destino',
    parent: 'peru',
    temporadas: {
      alta: 'junio a octubre. Época seca, senderos transitables, menos mosquitos.',
      media: 'abril, mayo y noviembre. Equilibrio entre lluvias y días secos.',
      baja: 'diciembre a marzo. Selva inundada, ideal para navegar entre árboles.'
    },
    presupuesto: {
      economico: '40-70 USD/día',
      estandar: '100-180 USD/día',
      premium: 'desde 250 USD/día'
    },
    altitud: '100 msnm',
    dificultad: 'Baja-Media',
    mejor_epoca: 'Junio a octubre',
    faq: [
      { q: '¿Cuántos días se necesitan para la Amazonía desde Iquitos?', r: 'La mayoría de lodges ofrece paquetes de 3 a 5 días.' },
      { q: '¿Cómo llegar a Iquitos?', r: 'Solo accesible por vía aérea o fluvial. Vuelos directos desde Lima (1.5 horas).' },
      { q: '¿Qué vacunas necesito para viajar a Iquitos?', r: 'Se recomienda la vacuna contra la fiebre amarilla al menos 10 días antes.' }
    ]
  },
  {
    slug: 'machu-picchu',
    nombre: 'Machu Picchu',
    h1: 'Visitar Machu Picchu: guía completa con entradas, rutas y consejos',
    resumen: 'Machu Picchu, la ciudadela inca Patrimonio de la Humanidad, es el destino arqueológico más importante de Sudamérica.',
    tipo: 'destino',
    parent: 'peru',
    temporadas: {
      alta: 'mayo a septiembre. Días despejados, ideal para fotografía.',
      media: 'abril y octubre. Buen clima con menor afluencia.',
      baja: 'noviembre a marzo. Lluvias frecuentes, paisajes más verdes.'
    },
    presupuesto: {
      economico: '80-120 USD (full day)',
      estandar: '150-250 USD (full day)',
      premium: 'desde 300 USD (full day)'
    },
    altitud: '2,430 msnm',
    dificultad: 'Media',
    mejor_epoca: 'Mayo a septiembre',
    faq: [
      { q: '¿Cómo se llega a Machu Picchu desde Cusco?', r: 'Tren desde Ollantaytambo o Poroy hasta Aguas Calientes, luego bus hasta la ciudadela. Total 3-4 horas.' },
      { q: '¿Cuánto cuesta la entrada a Machu Picchu?', r: 'La entrada general para extranjeros es aproximadamente 152 soles (unos 40 USD).' },
      { q: '¿Se necesita guía para visitar Machu Picchu?', r: 'Desde 2024 es obligatorio ingresar con un guía autorizado.' },
      { q: '¿Cuánto tiempo se necesita para recorrer Machu Picchu?', r: 'La visita guiada dura aproximadamente 2-3 horas. Máximo 4 horas desde el ingreso.' },
      { q: '¿Qué circuitos hay en Machu Picchu en 2026?', r: 'Hay 4 circuitos: Panorámico, Clásico, Real y Sagrado. Cada uno tiene rutas específicas.' }
    ]
  }
];

export const getDestinoBySlug = (slug) => destinos.find(d => d.slug === slug);
export const getDestinosByTipo = (tipo) => destinos.filter(d => d.tipo === tipo);
