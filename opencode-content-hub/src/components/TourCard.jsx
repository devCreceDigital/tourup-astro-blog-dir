import { Link } from 'react-router-dom';

export default function TourCard({ tour }) {
  return (
    <article className="card flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <span className={`badge-${tour.tipo === 'Privado' ? 'private' : 'group'}`}>
          {tour.tipo}
        </span>
        <span className="text-[12px] text-text-muted">{tour.duracion}</span>
      </div>
      <h3 className="text-[15px] font-semibold mb-2">{tour.nombre}</h3>
      <p className="text-[13px] text-text-secondary mb-3 flex-1">{tour.descripcion}</p>
      <div className="mb-3">
        <p className="text-[12px] text-text-muted mb-1">Incluye:</p>
        <ul className="text-[12px] text-text-secondary space-y-0.5">
          {tour.incluye.slice(0, 3).map((item, i) => (
            <li key={i} className="flex items-center gap-1">
              <svg className="w-3 h-3 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border-color">
        <div>
          <span className="text-[20px] font-bold text-accent">${tour.precio}</span>
          <span className="text-[12px] text-text-muted ml-1">USD</span>
        </div>
        <Link to={`/tours/${tour.slug}/`} className="btn-outline text-[12px] px-3 py-1.5">
          Ver tour
        </Link>
      </div>
    </article>
  );
}
