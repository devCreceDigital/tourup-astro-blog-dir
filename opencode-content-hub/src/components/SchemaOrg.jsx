export default function SchemaOrg({ type, data }) {
  const schemas = {
    TouristDestination: {
      '@context': 'https://schema.org',
      '@type': 'TouristDestination',
      name: data.name,
      description: data.description,
      url: data.url,
      image: data.image,
      touristType: data.touristType,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: data.latitude,
        longitude: data.longitude,
      },
    },
    TouristTrip: {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      name: data.name,
      description: data.description,
      itinerary: data.itinerary?.map((item, i) => ({
        '@type': 'TouristAttraction',
        name: item,
        position: i + 1,
      })),
    },
    FAQPage: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.r,
        },
      })),
    },
    ItemList: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: data.name,
      description: data.description,
      numberOfItems: data.items?.length || 0,
      itemListElement: data.items?.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: item.name,
          offers: {
            '@type': 'Offer',
            price: item.price,
            priceCurrency: 'USD',
          },
        },
      })),
    },
  };

  const schema = schemas[type];
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  );
}
