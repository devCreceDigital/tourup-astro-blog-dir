export default function BookingSidebar({ destino }) {
  return (
    <aside className="sidebar-card">
      <h3 className="text-[16px] font-semibold mb-1">{destino.nombre}</h3>
      <p className="text-[12px] text-text-muted mb-4">{destino.tipo === 'pais' ? 'Guía completa' : 'Guía de destino'}</p>

      <div className="mb-4">
        <span className="text-[28px] font-bold text-accent">${destino.presupuesto.estandar?.split(' ')[0] || '70'}</span>
        <span className="text-[13px] text-text-muted ml-1">/persona/día</span>
      </div>

      <Link to={`/peru/${destino.slug}/tours/`} className="btn-primary w-full text-center mb-4">
        Comparar tours
      </Link>

      <div className="space-y-3 text-[13px]">
        <div>
          <p className="font-semibold text-[11px] uppercase text-text-muted tracking-wider mb-1">Mejor época</p>
          <p>{destino.mejor_epoca}</p>
        </div>
        <div>
          <p className="font-semibold text-[11px] uppercase text-text-muted tracking-wider mb-1">Días recomendados</p>
          <p>{destino.tipo === 'pais' ? '7-14 días' : '3-5 días'}</p>
        </div>
        <div>
          <p className="font-semibold text-[11px] uppercase text-text-muted tracking-wider mb-1">Altitud</p>
          <p>{destino.altitud}</p>
        </div>
        <div>
          <p className="font-semibold text-[11px] uppercase text-text-muted tracking-wider mb-1">Dificultad</p>
          <p>{destino.dificultad}</p>
        </div>
      </div>
    </aside>
  );
}
