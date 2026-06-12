"""Expand taxonomy: destino + categoria_destino files for graph quality."""
import os
from pathlib import Path

SRC = Path("src/content")
DESTINOS_DIR = SRC / "destinos"
CATEGORIAS_DIR = SRC / "categorias_destino"

DESTINOS = [
    ("cusco", "Cusco", "Cusco",
     "Cusco, capital hist\u00f3rica del Imperio Inca y puerta de entrada a Machu Picchu. "
     "Es el principal destino tur\u00edstico del Per\u00fa, con la mayor concentraci\u00f3n de operadores receptivos."),
    ("lima", "Lima", "Lima",
     "Lima es la capital y principal hub de entrada a Per\u00fa. Combina gastronom\u00eda mundial, "
     "historia precolombina, turismo corporativo y experiencias de lujo."),
    ("arequipa", "Arequipa", "Arequipa",
     "Arequipa, la Ciudad Blanca, es el segundo destino tur\u00edstico del Per\u00fa. Puerta de entrada "
     "al Ca\u00f1\u00f3n del Colca con arquitectura colonial en sillar y volcanes."),
    ("puno", "Puno", "Puno",
     "Puno es la capital folcl\u00f3rica del Per\u00fa y puerta de entrada al Lago Titicaca, "
     "con las islas flotantes de los Uros y la cultura quechua-aimara."),
    ("ica", "Ica", "Ica",
     "Ica es el centro del enoturismo peruano, puerta de entrada a las L\u00edneas de Nazca, "
     "la Reserva de Paracas y las dunas de Huacachina."),
    ("paracas", "Paracas", "Ica",
     "Reserva Nacional de Paracas, \u00e1rea marino-costera con ballenas, ping\u00fcinos de Humboldt "
     "y formaciones rocosas. Principal destino de turismo marino desde Lima."),
    ("nazca", "Nazca", "Ica",
     "Nazca es famosa por sus L\u00edneas Patrimonio de la Humanidad y acueductos preincaicos. "
     "Destino imprescindible para arqueolog\u00eda y vuelos panor\u00e1micos."),
    ("huaraz", "Huaraz", "\u00c1ncash",
     "Huaraz es la capital del andinismo en Per\u00fa, puerta de entrada al Parque Nacional Huascar\u00e1n, "
     "la Laguna 69 y la Cordillera Blanca."),
    ("trujillo", "Trujillo", "La Libertad",
     "Trujillo es la capital de la marinera, puerta de entrada a Chan Chan, Huacas del Sol y la Luna, "
     "y las playas de Huanchaco."),
    ("chiclayo", "Chiclayo", "Lambayeque",
     "Chiclayo es el centro arqueol\u00f3gico del norte peruano, con el Se\u00f1or de Sip\u00e1n, "
     "las pir\u00e1mides de T\u00facume y el Museo Tumbas Reales."),
    ("piura", "Piura", "Piura",
     "Piura es el principal destino de sol y playa del Per\u00fa, con M\u00e1ncora, Col\u00e1n "
     "y Los \u00d3rganos para deportes acu\u00e1ticos y gastronom\u00eda norte\u00f1a."),
    ("iquitos", "Iquitos", "Loreto",
     "Iquitos es la ciudad m\u00e1s grande de la Amazon\u00eda peruana, puerta de entrada a lodges "
     "amaz\u00f3nicos y reservas naturales de biodiversidad \u00fanica."),
    ("puerto_maldonado", "Puerto Maldonado", "Madre de Dios",
     "Puerto Maldonado es la puerta de entrada a la Reserva Tambopata y el Parque Manu, "
     "\u00e1reas con la mayor biodiversidad del planeta."),
    ("cajamarca", "Cajamarca", "Cajamarca",
     "Cajamarca, destino hist\u00f3rico con el Cuarto del Rescate, ba\u00f1os termales del Inca "
     "y complejos arqueol\u00f3gicos de Cumbemayo."),
    ("chachapoyas", "Chachapoyas", "Amazonas",
     "Chachapoyas ofrece la Fortaleza de Ku\u00e9lap, la Catarata de Gocta y los sarc\u00f3fagos de Karaj\u00eda. "
     "Destino emergente para naturaleza y arqueolog\u00eda."),
    ("ayacucho", "Ayacucho", "Ayacucho",
     "Ayacucho, conocida por sus 33 iglesias coloniales y la Semana Santa m\u00e1s importante del Per\u00fa. "
     "Wari y Vilcashuam\u00e1n son sus complejos arqueol\u00f3gicos principales."),
    ("tarapoto", "Tarapoto", "San Mart\u00edn",
     "Tarapoto es el centro de la Amazon\u00eda alta peruana con cataratas, lagunas, rafting "
     "y turismo de aventura en selva de monta\u00f1a."),
    ("colca", "Colca", "Arequipa",
     "El Ca\u00f1\u00f3n del Colca, uno de los m\u00e1s profundos del mundo, es famoso por el vuelo "
     "del c\u00f3ndor, terrazas preincaicas y aguas termales."),
    ("manu", "Manu", "Madre de Dios / Cusco",
     "El Parque Nacional del Manu, Patrimonio de la Humanidad, es una de las \u00e1reas protegidas "
     "m\u00e1s biodiversas del planeta para observaci\u00f3n de fauna."),
    ("machu_picchu", "Machu Picchu", "Cusco",
     "Machu Picchu, ciudadela inca Patrimonio de la Humanidad, es el destino estrella del Per\u00fa "
     "y principal motivo de visita para turistas internacionales."),
]

CATEGORIAS = [
    "full-day", "multi-day", "trekking", "tours-culturales",
    "aventura", "lujo", "tours-comunitarios", "birdwatching",
    "gastronomico", "familia", "bienestar", "fotografia",
    "navegacion", "mice", "educativo", "arqueologico",
    "playa", "selva",
]

def make_destino_faqs(slug, name):
    custom = {
        "cusco": """
  - question: "\u00bfCu\u00e1l es la mejor \u00e9poca para visitar Cusco?"
    answer: "La temporada seca (mayo a octubre) es la m\u00e1s recomendada. La temporada alta es julio y agosto."
  - question: "\u00bfQu\u00e9 operadores tur\u00edsticos est\u00e1n certificados por MINCETUR en Cusco?"
    answer: "MINCETUR publica un registro actualizado. Los operadores certificados deben mostrar su licencia vigente."
  - question: "\u00bfCu\u00e1ntos d\u00edas se necesitan para visitar Cusco y Machu Picchu?"
    answer: "M\u00ednimo 4 d\u00edas: 1-2 para aclimataci\u00f3n en Cusco, 1 d\u00eda en el Valle Sagrado y 1 d\u00eda completo en Machu Picchu."
""",
        "lima": """
  - question: "\u00bfLima es solo un destino de paso?"
    answer: "Lima merece al menos 2-3 d\u00edas. El Centro Hist\u00f3rico (UNESCO), Miraflores, Barranco y la gastronom\u00eda ofrecen experiencias \u00fanicas."
  - question: "\u00bfQu\u00e9 operadores en Lima trabajan con agencias B2B?"
    answer: "Los grandes operadores receptivos del Per\u00fa tienen sede en Lima (Miraflores o San Isidro) aunque operen en todo el pa\u00eds."
""",
    }
    if slug in custom:
        return custom[slug]
    return f"""
  - question: "\u00bfCu\u00e1l es la mejor \u00e9poca para visitar {name}?"
    answer: "Depende del tipo de experiencia. Recomendamos coordinar directamente con los operadores locales sobre disponibilidad y temporadas."
  - question: "\u00bfQu\u00e9 operadores certificados por MINCETUR hay en {name}?"
    answer: "MINCETUR mantiene un registro actualizado. En TourUp encontrar\u00e1s operadores verificados con licencia vigente."
  - question: "\u00bfCu\u00e1ntos d\u00edas se recomiendan para {name}?"
    answer: "M\u00ednimo 2-3 d\u00edas. Consulta con nuestros operadores asociados para itinerarios B2B personalizados."
"""

def make_destino(slug, name, region, summary):
    path = DESTINOS_DIR / f"{slug}.md"
    if path.exists():
        print(f"  EXISTS: destino/{slug}.md")
        return
    faqs = make_destino_faqs(slug, name)
    content = f"""---
type: destino
name: {name}
country: Peru
region: {region}
summary: "{summary}"
parent: peru
seo_title: "Agencias y operadores tur\u00edsticos en {name}, Per\u00fa"
faq:{faqs}
---

## {name} como destino B2B

{summary}

## Productos tur\u00edsticos principales

Los operadores receptivos en {name} ofrecen servicios para agencias emisoras y compradores B2B que buscan experiencias aut\u00e9nticas y operadores verificados en Per\u00fa.
"""
    path.write_text(content.strip(), encoding="utf-8")
    print(f"  CREATED: destino/{slug}.md")

def make_categoria_destino(destino_slug, categoria, destino_name):
    cat_name = categoria.replace("-", " ").title()
    slug = f"{destino_slug}-{categoria}"
    path = CATEGORIAS_DIR / f"{slug}.md"
    if path.exists():
        return

    content = f"""---
type: categoria_destino
destino_slug: {destino_slug}
categoria: {categoria}
name: {cat_name} en {destino_name}
summary: "Tours y servicios de {cat_name.lower()} en {destino_name} para agencias B2B. Operadores verificados con tarifas netas para compradores profesionales."
faq:
  - question: "\u00bfQu\u00e9 operadores ofrecen {cat_name.lower()} en {destino_name}?"
    answer: "En TourUp encontrar\u00e1s operadores receptivos verificados que ofrecen {cat_name.lower()} en {destino_name} con ratings y licencias verificadas."
  - question: "\u00bfCu\u00e1l es el precio neto B2B para {cat_name.lower()} en {destino_name}?"
    answer: "Los precios var\u00edan seg\u00fan operador y grupo. Reg\u00edstrate en TourUp como agencia para acceder a tarifas netas directas."
---
"""
    path.write_text(content.strip(), encoding="utf-8")
    print(f"  CREATED: categoria_destino/{slug}.md")

def build_all():
    print("=== Fase 1: Destinos ===")
    DESTINOS_DIR.mkdir(parents=True, exist_ok=True)
    for slug, name, region, summary in DESTINOS:
        make_destino(slug, name, region, summary)

    print(f"\n=== Fase 2: Categorias_Destino ===")
    CATEGORIAS_DIR.mkdir(parents=True, exist_ok=True)
    for slug, name, _, _ in DESTINOS:
        for cat in CATEGORIAS:
            make_categoria_destino(slug, cat, name)
    for fp in sorted(DESTINOS_DIR.glob("*.md")):
        slug = fp.stem
        if slug not in {d[0] for d in DESTINOS}:
            for cat in CATEGORIAS:
                make_categoria_destino(slug, cat, slug.title())

    total_d = sum(1 for _ in DESTINOS_DIR.glob("*.md"))
    total_c = sum(1 for _ in CATEGORIAS_DIR.glob("*.md"))
    print(f"\nTotal destinos: {total_d}")
    print(f"Total categorias_destino: {total_c}")

if __name__ == "__main__":
    build_all()
