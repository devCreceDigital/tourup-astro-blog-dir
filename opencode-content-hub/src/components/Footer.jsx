import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border-color mt-16 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold text-[13px] uppercase text-text-muted tracking-wider mb-3">Destinos</h4>
            <ul className="space-y-2">
              <li><Link to="/peru/cusco/" className="font-mono text-[12px]">/peru/cusco/</Link></li>
              <li><Link to="/peru/lima/" className="font-mono text-[12px]">/peru/lima/</Link></li>
              <li><Link to="/peru/arequipa/" className="font-mono text-[12px]">/peru/arequipa/</Link></li>
              <li><Link to="/peru/puno/" className="font-mono text-[12px]">/peru/puno/</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[13px] uppercase text-text-muted tracking-wider mb-3">Tours</h4>
            <ul className="space-y-2">
              <li><Link to="/peru/cusco/tours-machu-picchu/" className="font-mono text-[12px]">/tours/machu-picchu/</Link></li>
              <li><Link to="/peru/cusco/tours/" className="font-mono text-[12px]">/tours/valle-sagrado/</Link></li>
              <li><Link to="/peru/cusco/tours/" className="font-mono text-[12px]">/tours/camino-inca/</Link></li>
              <li><Link to="/peru/arequipa/tours/" className="font-mono text-[12px]">/tours/colca/</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[13px] uppercase text-text-muted tracking-wider mb-3">Itinerarios</h4>
            <ul className="space-y-2">
              <li><Link to="/peru/itinerario-10-dias/" className="font-mono text-[12px]">/peru/10-dias/</Link></li>
              <li><Link to="/peru/itinerario-10-dias/" className="font-mono text-[12px]">/peru/7-dias/</Link></li>
              <li><Link to="/peru/itinerario-10-dias/" className="font-mono text-[12px]">/peru/14-dias/</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[13px] uppercase text-text-muted tracking-wider mb-3">Información</h4>
            <ul className="space-y-2">
              <li><Link to="/peru/preguntas-frecuentes-viajar-a-peru/" className="font-mono text-[12px]">/faqs/</Link></li>
              <li><Link to="/blog/" className="font-mono text-[12px]">/blog/</Link></li>
              <li><Link to="/b2b/" className="font-mono text-[12px]">/b2b/</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border-color text-center text-[12px] text-text-muted">
          <p>&copy; {new Date().getFullYear()} PeruTours. Todos los derechos reservados.</p>
          <p className="mt-1">Hecho con ❤️ para viajeros que quieren descubrir Perú.</p>
        </div>
      </div>
    </footer>
  );
}
