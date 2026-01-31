# Dónde usar el elemento que sigue al mouse en la landing

El **MouseFollower** es un elemento con `position: fixed` + `transform` que sigue al cursor (patrón tipo Mercado Libre: tracking visual, tutoriales, micro-interacciones). **No mueve el scroll**; es el elemento el que se desplaza.

---

## Ubicación en el código

- **Componente:** `components/mouse-follower.tsx`
- **Uso en la landing:** `app/page.tsx`, dentro del mismo contenedor que `ScrollProgress` y `FloatingCTA` (hermano de ellos).

El elemento se posiciona con:

- `position: fixed`
- `transform: translate(x, y)` (mejor rendimiento que `left`/`top`)
- `pointer-events: none`
- `z-index: 999` (configurable)
- Opcional: `cursor: none` cuando está visible (`hideCursor`)

---

## Dónde tiene sentido usarlo en la landing

### 1. Refuerzo del CTA (uso actual) ✅

- **Dónde:** Toda la página **después del hero** (a partir de ~500px de scroll).
- **Qué hace:** Badge que sigue al mouse con texto tipo “Inscribirse en convención”.
- **Cómo:** `showOnlyAfterScrollY={500}` para que no compita con el hero y refuerce el botón flotante.

### 2. Solo en el Hero (hint sutil)

- **Dónde:** Solo en la sección Hero (primeros ~600px).
- **Qué hace:** Un hint muy suave: “Explorar”, “Ver convenciones” o un icono.
- **Cómo:** Lógica inversa: mostrar solo cuando `scrollY < 600` (habría que añadir una prop tipo `showOnlyBeforeScrollY` o usar dos instancias con condiciones distintas).

### 3. Solo en la sección Convenciones

- **Dónde:** Cuando el usuario está en `#convenciones` (scroll dentro de esa sección).
- **Qué hace:** Micro-interacción “Inscribirse aquí” o “Reservar lugar” que refuerza el CTA de esa sección.
- **Cómo:** Detectar visibilidad de `#convenciones` (Intersection Observer) y pasar `enabled={isConvencionesVisible}` a `MouseFollower`, o un wrapper que renderice el follower solo en esa zona.

### 4. Tutorial / onboarding (primera visita)

- **Dónde:** Solo la primera vez que el usuario entra a la landing.
- **Qué hace:** Tooltip que sigue al mouse y apunta al CTA (“Haz clic aquí para inscribirte”).
- **Cómo:** `localStorage` (ej. `amva_landing_seen`) y `enabled={!hasSeenLanding}`; opcionalmente `hideCursor={true}` para estilo “tutorial”.

---

## Resumen recomendado

| Uso              | Dónde aparece     | Cuándo mostrarlo              |
|------------------|-------------------|------------------------------|
| Refuerzo CTA     | Toda la página    | Después del hero (scroll > 500px) |
| Hint en Hero     | Solo hero         | scroll < 600px                |
| Micro en Convenciones | Sección convenciones | Cuando #convenciones está en viewport |
| Tutorial         | Primera visita    | Si no hay flag en localStorage |

El uso actual (refuerzo CTA después del hero) es el más equilibrado: no distrae en el hero y refuerza la acción en el resto de la página.
