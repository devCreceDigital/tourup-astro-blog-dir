/**
 * Limitador de intentos en memoria (ventana fija).
 * Se reinicia al reiniciar el proceso; suficiente como freno de fuerza bruta en un solo nodo.
 */
export interface RateLimiter {
  /** Cuenta un intento. Devuelve false si `key` ya superó el máximo dentro de la ventana. */
  hit(key: string): boolean;
  /** Borra el contador (p. ej. tras un login correcto). */
  reset(key: string): void;
}

const MAX_TRACKED_KEYS = 5000;

export function createRateLimiter(max: number, windowMs: number, now: () => number = Date.now): RateLimiter {
  const entries = new Map<string, { count: number; resetAt: number }>();

  function prune(t: number) {
    for (const [k, v] of entries) if (t > v.resetAt) entries.delete(k);
    // Con muchas claves distintas (ataque con IPs/usuarios aleatorios) descartamos las más antiguas.
    while (entries.size > MAX_TRACKED_KEYS) entries.delete(entries.keys().next().value as string);
  }

  return {
    hit(key) {
      const t = now();
      if (entries.size >= MAX_TRACKED_KEYS) prune(t);
      const e = entries.get(key);
      if (!e || t > e.resetAt) {
        entries.set(key, { count: 1, resetAt: t + windowMs });
        return true;
      }
      if (e.count >= max) return false;
      e.count++;
      return true;
    },
    reset(key) {
      entries.delete(key);
    },
  };
}
