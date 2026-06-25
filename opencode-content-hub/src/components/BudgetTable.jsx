export default function BudgetTable({ presupuesto }) {
  if (!presupuesto) return null;
  const levels = [
    { key: 'economico', label: 'Económico', color: 'bg-green-50 border-green-200' },
    { key: 'estandar', label: 'Estándar', color: 'bg-blue-50 border-blue-200' },
    { key: 'premium', label: 'Premium', color: 'bg-purple-50 border-purple-200' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {levels.map((level) => (
        <div key={level.key} className={`card border ${level.color}`}>
          <p className="font-semibold text-[13px] mb-1">{level.label}</p>
          <p className="text-[20px] font-bold text-accent">{presupuesto[level.key]}</p>
        </div>
      ))}
    </div>
  );
}
