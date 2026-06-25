$categoryInfo = @{
  "arqueologico"     = @{ name="Arqueológico"; desc="sitios arqueológicos, ruinas precolombinas y complejos ceremoniales"; act="actividades arqueológicas" }
  "aventura"         = @{ name="Aventura"; desc="rafting, canopy, tirolesa, escalada en roca y deportes de aventura"; act="actividades de aventura" }
  "bienestar"        = @{ name="Bienestar"; desc="spa, yoga, meditación, aguas termales y terapias holísticas"; act="experiencias de bienestar" }
  "birdwatching"     = @{ name="Birdwatching"; desc="observación de aves, rutas ornitológicas y expediciones de avistamiento"; act="rutas de birdwatching" }
  "educativo"        = @{ name="Educativo"; desc="talleres culturales, clases de cocina, aprendizaje de artesanía"; act="programas educativos" }
  "familia"          = @{ name="Familiar"; desc="tours y actividades diseñados para viajar en familia con niños"; act="actividades familiares" }
  "fotografia"       = @{ name="Fotografía"; desc="tours fotográficos, rutas del amanecer, paisajes y vida silvestre"; act="rutas fotográficas" }
  "full-day"         = @{ name="Full Day"; desc="excursiones de día completo que cubren los principales atractivos"; act="tours full day" }
  "gastronomico"     = @{ name="Gastronómico"; desc="recorridos culinarios, clases de cocina, visitas a mercados y degustaciones"; act="experiencias gastronómicas" }
  "lujo"             = @{ name="Lujo"; desc="experiencias premium, hoteles boutique, servicios exclusivos"; act="experiencias de lujo" }
  "mice"             = @{ name="MICE"; desc="eventos corporativos, congresos, incentivos y reuniones de negocios"; act="servicios MICE" }
  "multi-day"        = @{ name="Multi-Day"; desc="itinerarios de varios días que combinan múltiples destinos"; act="tours multi-day" }
  "navegacion"       = @{ name="Navegación"; desc="paseos en barco, lancha, kayak y deportes acuáticos"; act="experiencias de navegación" }
  "playa"            = @{ name="Playa"; desc="balnearios, deportes acuáticos, relax en la costa"; act="días de playa" }
  "selva"            = @{ name="Selva"; desc="caminatas por la selva, observación de fauna, lodges amazónicos"; act="experiencias de selva" }
  "tours-culturales" = @{ name="Tours Culturales"; desc="recorridos por centros históricos, museos, iglesias y monumentos"; act="tours culturales" }
  "tours-comunitarios" = @{ name="Tours Comunitarios"; desc="turismo vivencial en comunidades locales y tradiciones ancestrales"; act="experiencias comunitarias" }
  "trekking"         = @{ name="Trekking"; desc="caminatas de montaña, rutas de trekking, lagunas y paisajes"; act="rutas de trekking" }
}

$destinationNames = @{
  "arequipa" = "Arequipa"; "ayacucho" = "Ayacucho"; "cajamarca" = "Cajamarca"
  "chachapoyas" = "Chachapoyas"; "chiclayo" = "Chiclayo"; "colca" = "Colca"
  "cusco" = "Cusco"; "huaraz" = "Huaraz"; "ica" = "Ica"
  "iquitos" = "Iquitos"; "lima" = "Lima"; "manu" = "Manu"
  "machu_picchu" = "Machu Picchu"; "nazca" = "Nazca"; "paracas" = "Paracas"
  "piura" = "Piura"; "puno" = "Puno"; "puerto_maldonado" = "Puerto Maldonado"
  "tarapoto" = "Tarapoto"; "trujillo" = "Trujillo"
}

$total = 0; $updated = 0; $skipped = 0

Get-ChildItem "src/content/categorias_destino/*.md" | ForEach-Object {
  $total++
  $path = $_.FullName
  $content = Get-Content $path -Raw
  
  # Find closing --- (last occurrence is the end of frontmatter)
  $closingIdx = $content.LastIndexOf("---")
  if ($closingIdx -le 2) { $skipped++; return }  # Not found or first ---
  
  $afterFrontmatter = $content.Substring($closingIdx + 3)
  $body = $afterFrontmatter.Trim()
  
  if ($body.Length -gt 20) { $skipped++; return } # Already has content
  
  # Extract frontmatter fields
  if ($content -match 'destino_slug:\s*(\S+)') { $destSlug = $matches[1] } else { $skipped++; return }
  if ($content -match 'categoria:\s*(\S+)') { $catSlug = $matches[1] } else { $skipped++; return }
  if ($content -match 'name:\s*(.+)') { $catName = $matches[1] } else { $skipped++; return }
  
  $destName = $destinationNames[$destSlug]
  if (-not $destName) { $destName = (Get-Culture).TextInfo.ToTitleCase($destSlug) }
  
  $catInfo = $categoryInfo[$catSlug]
  if (-not $catInfo) { $skipped++; return }
  
  $newBody = @"

## Tours de $($catInfo['name']) en $destName

Los tours de $catSlug en $destName incluyen $($catInfo['desc']). Esta categoría agrupa a los operadores turísticos verificados que ofrecen $($catInfo['act']) en $destName y sus alrededores.

## ¿Qué esperar de estos tours en $destName?

Los operadores de esta categoría ofrecen servicios diseñados para diferentes tipos de viajero, desde opciones económicas hasta experiencias premium. Todos cuentan con licencia MINCETUR vigente y verificaciones de calidad.

## Consejos para elegir tu tour de $($catInfo['name']) en $destName

- Revisa las calificaciones y comentarios de otros viajeros sobre el operador
- Compara los precios y qué incluye cada paquete (transporte, guía, entradas, alimentación)
- Verifica la duración del tour y los horarios de salida y retorno
- Confirma si el tour opera con grupo compartido o privado según tu preferencia
- Pregunta por la política de cancelación antes de reservar
"@
  
  $newContent = $content.Substring(0, $closingIdx + 3) + $newBody
  
  Set-Content -Path $path -Value $newContent -NoNewline
  $updated++
  Write-Progress -Activity "Expandiendo categorías" -Status "$destName - $catSlug" -PercentComplete (($total / 360) * 100)
}

"Total: $total | Actualizados: $updated | Saltados (ya tenían contenido): $skipped"
