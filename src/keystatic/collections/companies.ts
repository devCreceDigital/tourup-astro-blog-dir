import { collection, fields } from '@keystatic/core';
import { bilingualText, bilingualTextarea, optionalBilingualText, optionalBilingualTextarea } from '../fields/bilingual';
import { seoFields } from '../fields/seo';
import { localImage } from '../fields/image';

export const companiesCollection = collection({
  label: { es: 'Empresas', en: 'Companies' },
  slugField: 'title.es',
  path: 'src/content/companies/*',
  format: { contentField: 'body' },
  schema: {
    title: bilingualText({ es: 'Título', en: 'Title' }),
    distribution_role: fields.select({
      label: { es: 'Rol de distribución', en: 'Distribution Role' },
      options: [
        { label: 'Tour Operator', value: 'tour_operator' },
        { label: 'Retail Travel Agency', value: 'retail_travel_agency' },
        { label: 'Wholesale Travel Agency', value: 'wholesale_travel_agency' },
        { label: 'Online Travel Agency', value: 'online_travel_agency' },
        { label: 'DMC', value: 'dmc' },
        { label: 'Mixed Agency', value: 'mixed_agency' },
      ],
      defaultValue: 'tour_operator',
    }),
    sales_channel: fields.select({
      label: { es: 'Canal de venta', en: 'Sales Channel' },
      options: [
        { label: 'Online', value: 'online' },
        { label: 'Offline', value: 'offline' },
        { label: 'Omnichannel', value: 'omnichannel' },
      ],
      defaultValue: 'omnichannel',
    }),
    summary: bilingualTextarea({ es: 'Resumen', en: 'Summary' }),
    canonical_answer: bilingualTextarea({ es: 'Respuesta Canónica', en: 'Canonical Answer' }),
    llm_intent: optionalBilingualText({ es: 'Intención LLM', en: 'LLM Intent' }),
    rating: fields.number({ label: 'Rating', validation: { min: 0, max: 5, step: 0.1 } }),
    reviews_count: fields.number({ label: { es: 'Nº Reviews', en: 'Reviews Count' }, validation: { min: 0 } }),
    b2b_profile: optionalBilingualText({ es: 'Perfil B2B', en: 'B2B Profile' }),
    destinos: fields.array(
      fields.text({ label: { es: 'Destino slug', en: 'Destination slug' } }),
      { label: { es: 'Destinos', en: 'Destinations' }, itemLabel: (props) => props.value }
    ),
    categorias: fields.array(
      fields.text({ label: { es: 'Categoría slug', en: 'Category slug' } }),
      { label: { es: 'Categorías', en: 'Categories' }, itemLabel: (props) => props.value }
    ),
    nap: fields.object({
      label: { es: 'NAP (Dirección/Contacto)', en: 'NAP (Address/Contact)' },
      city: bilingualText({ es: 'Ciudad', en: 'City' }),
      country: fields.text({ label: 'Country', defaultValue: 'Peru' }),
      phone: optionalBilingualText({ es: 'Teléfono', en: 'Phone' }),
      email: fields.text({ label: 'Email', validation: { pattern: '^\\S+@\\S+\\.\\S+$' } }),
      website: fields.text({ label: { es: 'Sitio Web', en: 'Website' }, validation: { pattern: '^https?://' } }),
      address: optionalBilingualText({ es: 'Dirección', en: 'Address' }),
    }),
    licenses: fields.array(
      fields.object({
        label: { es: 'Licencia', en: 'License' },
        type: fields.text({ label: { es: 'Tipo', en: 'Type' } }),
        id: fields.text({ label: 'ID' }),
        issuer: optionalBilingualText({ es: 'Emisor', en: 'Issuer' }),
      }),
      { label: { es: 'Licencias', en: 'Licenses' }, itemLabel: (props) => props.fields.type.value }
    ),
    trust_metrics: fields.object({
      label: { es: 'Métricas de Confianza', en: 'Trust Metrics' },
      avg_response_time_hours: fields.number({ label: { es: 'Tiempo resp. medio (h)', en: 'Avg Response Time (h)' } }),
      incident_rate: fields.number({ label: { es: 'Tasa incidentes', en: 'Incident Rate' }, validation: { min: 0, max: 1 } }),
      group_capacity_max: fields.number({ label: { es: 'Capacidad máx. grupos', en: 'Max Group Capacity' } }),
      b2b_client_types: fields.array(
        fields.text({ label: { es: 'Tipo cliente B2B', en: 'B2B Client Type' } }),
        { label: { es: 'Tipos de cliente', en: 'Client Types' } }
      ),
      languages: fields.array(
        fields.text({ label: { es: 'Idioma', en: 'Language' } }),
        { label: { es: 'Idiomas', en: 'Languages' } }
      ),
    }),
    testimonials: fields.array(
      fields.object({
        label: { es: 'Testimonio', en: 'Testimonial' },
        author: bilingualText({ es: 'Autor', en: 'Author' }),
        text: bilingualTextarea({ es: 'Texto', en: 'Text' }),
        date: fields.text({ label: 'Fecha', validation: { isRequired: false } }),
        source: optionalBilingualText({ es: 'Fuente', en: 'Source' }),
      }),
      { label: { es: 'Testimonios', en: 'Testimonials' }, itemLabel: (props) => props.fields.author.es.value }
    ),
    faq: fields.array(
      fields.object({
        label: { es: 'FAQ', en: 'FAQ' },
        question: bilingualText({ es: 'Pregunta', en: 'Question' }),
        answer: bilingualTextarea({ es: 'Respuesta', en: 'Answer' }),
      }),
      { label: { es: 'FAQs', en: 'FAQs' }, itemLabel: (props) => props.fields.question.es.value }
    ),
    hero_image: localImage({ es: 'Imagen Principal', en: 'Hero Image' }),
    gallery: fields.array(
      localImage({ es: 'Imagen Galería', en: 'Gallery Image' }),
      { label: { es: 'Galería', en: 'Gallery' }, itemLabel: (props) => props.value?.alt || 'Imagen' }
    ),
    contact: fields.object({
      label: { es: 'Contacto (Legacy)', en: 'Contact (Legacy)' },
      website: optionalBilingualText({ es: 'Web', en: 'Website' }),
      email: fields.text({ label: 'Email', validation: { isRequired: false } }),
      phone: optionalBilingualText({ es: 'Teléfono', en: 'Phone' }),
      phone_alt_1: optionalBilingualText({ es: 'Tel. Alt 1', en: 'Alt Phone 1' }),
      phone_alt_2: optionalBilingualText({ es: 'Tel. Alt 2', en: 'Alt Phone 2' }),
    }),
    location: fields.object({
      label: { es: 'Ubicación (Legacy)', en: 'Location (Legacy)' },
      city: optionalBilingualText({ es: 'Ciudad', en: 'City' }),
      province: optionalBilingualText({ es: 'Provincia', en: 'Province' }),
      region: optionalBilingualText({ es: 'Región', en: 'Region' }),
      country: fields.text({ label: 'Country', defaultValue: 'Peru' }),
      ubigeo_code: optionalBilingualText({ es: 'Código Ubigeo', en: 'Ubigeo Code' }),
    }),
    regulation: fields.object({
      label: { es: 'Regulación (Legacy)', en: 'Regulation (Legacy)' },
      tax_id: optionalBilingualText({ es: 'RUC/Tax ID', en: 'Tax ID' }),
      license_number: optionalBilingualText({ es: 'Nº Licencia', en: 'License Number' }),
      license_issue_date: fields.text({ label: 'Fecha Emisión', validation: { isRequired: false } }),
    }),
    legal_representative: optionalBilingualText({ es: 'Representante Legal', en: 'Legal Representative' }),
    mentioned_in_prompts: fields.array(
      fields.text({ label: { es: 'Prompt slug', en: 'Prompt slug' } }),
      { label: { es: 'Mencionado en Prompts', en: 'Mentioned in Prompts' }, itemLabel: (props) => props.value }
    ),
    ...seoFields,
    body: fields.markdoc({ label: { es: 'Contenido', en: 'Content' } }),
  },
});