import { useState } from 'react';

export default function FAQAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="card overflow-hidden">
          <button
            className="w-full flex items-center justify-between text-left font-semibold text-[14px] py-1"
            onClick={() => toggle(i)}
            aria-expanded={openIndex === i}
          >
            <span>{item.q}</span>
            <svg
              className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
                openIndex === i ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            className={`overflow-hidden transition-all duration-200 ${
              openIndex === i ? 'max-h-96 mt-2' : 'max-h-0'
            }`}
          >
            <p className="text-text-secondary text-[14px] leading-relaxed">{item.r}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
