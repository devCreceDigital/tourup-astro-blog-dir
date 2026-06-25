export const itinerarios = [
  {
    slug: '10-dias',
    titulo: 'Itinerario de 10 días por Perú: Lima, Cusco, Machu Picchu y Lago Titicaca',
    descripcion: 'Un recorrido clásico por el sur de Perú que combina la capital gastronómica, la capital del Imperio Inca, la maravilla del mundo y el lago navegable más alto del planeta.',
    total_dias: 10,
    presupuesto: {
      economico: { rango: '800-1000 USD', incluye: 'hostales, comidas en mercados, buses públicos, tours compartidos' },
      estandar: { rango: '1200-1800 USD', incluye: 'hoteles 3 estrellas, restaurantes, vuelos internos, tours grupales con guía' },
      premium: { rango: '2500-4000 USD', incluye: 'hoteles 5 estrellas, restaurantes fine dining, tours privados, tren Hiram Bingham' }
    },
    variantes: [
      'Añadir Amazonía (Iquitos o Puerto Maldonado): 3-4 días adicionales',
      'Añadir Arequipa y Cañón del Colca: 3 días adicionales',
      'Añadir costa norte (Trujillo, Chiclayo): 3-4 días adicionales',
      'Extender a 14 días para un viaje más relajado'
    ],
    dias: [
      { dia: 1, titulo: 'Llegada a Lima', descripcion: 'Llegada al Aeropuerto Internacional Jorge Chávez. Por la tarde, explora Miraflores: el Malecón, el Parque del Amor y Larcomar. Cena de bienvenida en un restaurante de cocina peruana.', comida: 'Cena en Miraflores', hospedaje: 'Miraflores' },
      { dia: 2, titulo: 'Lima: Centro Histórico y Barranco', descripcion: 'Por la mañana, visita al Centro Histórico: Plaza Mayor, Catedral y Catacumbas de San Francisco. Tarde en Barranco: murales, galerías y el Puente de los Suspiros. Cena en un restaurante de alta cocina.', comida: 'Almuerzo en Barranco', hospedaje: 'Miraflores' },
      { dia: 3, titulo: 'Vuelo a Cusco y aclimatación', descripcion: 'Vuelo matutino a Cusco (1 hora). Tarde de aclimatación: caminata ligera por la Plaza de Armas, visita al Qoricancha. Mate de coca y mucha hidratación. Cena temprano.', comida: 'Almuerzo en San Pedro Market', hospedaje: 'Centro de Cusco' },
      { dia: 4, titulo: 'Valle Sagrado: Pisac y Ollantaytambo', descripcion: 'Full day por el Valle Sagrado. Mercado artesanal de Pisac, fortaleza de Ollantaytambo. Almuerzo buffet en Urubamba. Retorno a Cusco por la tarde.', comida: 'Almuerzo buffet en Urubamba', hospedaje: 'Centro de Cusco' },
      { dia: 5, titulo: 'Valle Sagrado: Moray, Maras y Chinchero', descripcion: 'Visita a los andenes circulares de Moray, las Salineras de Maras y el pueblo textil de Chinchero. Tarde libre para explorar San Blas.', comida: 'Almuerzo en Chinchero', hospedaje: 'Centro de Cusco' },
      { dia: 6, titulo: 'Machu Picchu Full Day', descripcion: 'Salida 4:00 am. Tren a Aguas Calientes, bus a la ciudadela. Visita guiada de 2-3 horas. Tiempo libre para fotos. Retorno a Cusco por la noche.', comida: 'Box lunch', hospedaje: 'Centro de Cusco' },
      { dia: 7, titulo: 'Día libre o Montaña 7 Colores', descripcion: 'Día opcional: excursión a la Montaña de 7 Colores (Vinicunca) a 5,200 msnm, o día libre para compras en San Blas y visita al Museo de Arte Precolombino.', comida: 'Según actividad', hospedaje: 'Centro de Cusco' },
      { dia: 8, titulo: 'Bus turístico Cusco - Puno', descripcion: 'Bus turístico de 6-7 horas con paradas en Andahuaylillas (Capilla Sixtina de América), Raqchi (Templo de Wiracocha) y La Raya (frontera natural). Llegada a Puno por la tarde.', comida: 'Almuerzo en ruta', hospedaje: 'Puno' },
      { dia: 9, titulo: 'Lago Titicaca: Uros y Taquile', descripcion: 'Navegación por el Lago Titicaca. Visita a las islas flotantes de los Uros, construidas de totora. Caminata en Taquile con sus textiles patrimoniales. Retorno a Puno.', comida: 'Almuerzo en Taquile', hospedaje: 'Puno' },
      { dia: 10, titulo: 'Retorno: Puno - Lima - Salida', descripcion: 'Vuelo de Puno a Lima (vía Juliaca). Conexión con vuelo internacional. Últimas compras en el aeropuerto.', comida: 'Según horario', hospedaje: '---' }
    ]
  }
];

export const getItinerarioBySlug = (slug) => itinerarios.find(i => i.slug === slug);
