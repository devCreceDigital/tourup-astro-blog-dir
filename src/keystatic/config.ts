import { config } from '@keystatic/core';
import {
  companiesCollection,
  destinosCollection,
  destinosEnCollection,
  categoriasDestinoCollection,
  externalBrandsCollection,
  promptsCollection,
  promptsEsCollection,
  postsCollection,
} from './collections';

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    companies: companiesCollection,
    destinos: destinosCollection,
    destinos_en: destinosEnCollection,
    categorias_destino: categoriasDestinoCollection,
    external_brands: externalBrandsCollection,
    prompts: promptsCollection,
    prompts_es: promptsEsCollection,
    posts: postsCollection,
  },
  ui: {
    brand: {
      name: 'TourUp CMS',
      logo: { kind: 'text', value: 'TourUp' },
    },
    navigation: [
      { collection: 'companies', label: { es: 'Empresas', en: 'Companies' } },
      { collection: 'destinos', label: { es: 'Destinos ES', en: 'Destinations ES' } },
      { collection: 'destinos_en', label: { es: 'Destinos EN', en: 'Destinations EN' } },
      { collection: 'categorias_destino', label: { es: 'Categorías Destino', en: 'Destination Categories' } },
      { collection: 'external_brands', label: { es: 'Marcas Externas', en: 'External Brands' } },
      { collection: 'prompts', label: { es: 'Prompts EN', en: 'Prompts EN' } },
      { collection: 'prompts_es', label: { es: 'Prompts ES', en: 'Prompts ES' } },
      { collection: 'posts', label: { es: 'Posts', en: 'Posts' } },
    ],
  },
});