import React from 'react';

export default function FAQ({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Preguntas Frecuentes</h2>
      {items.map((item, i) => (
        <details key={i} className="border-b border-gray-300 py-2">
          <summary className="cursor-pointer font-semibold">{item.pregunta}</summary>
          <p className="mt-2 text-gray-700">{item.respuesta}</p>
        </details>
      ))}
    </section>
  );
}
