# Mejoras recomendadas para la landing page

Recomendaciones priorizadas para la landing (AMVA Digital / Vida Abundante). No es obligatorio implementar todo; se puede ir por fases.

---

## Prioridad alta (rápidas y con impacto)

### 1. Quitar ScrollProgress duplicado

- **Problema:** `ScrollProgress` está en **`app/layout.tsx`** y también en **`app/page.tsx`**. En la landing se pintan dos barras de progreso.
- **Solución:** Dejar solo en el layout (para todas las páginas) y **eliminar** el import y el `<ScrollProgress />` de `app/page.tsx`.

### 2. Corregir enlace "Conocer Más" del hero

- **Problema:** El botón del hero apunta a `#nosotros` pero la sección tiene `id="mision"`. El ancla no coincide.
- **Solución:** Cambiar el `Link` de "Conocer Más" a `href="#mision"` (o crear un id `nosotros` en esa sección si prefieres esa URL).

### 3. Enlace "Saltar al contenido" (accesibilidad)

- **Qué:** Un enlace al inicio de la página que solo se ve al enfocar con teclado (Tab). Permite a usuarios de teclado y lectores de pantalla saltar el menú.
- **Dónde:** Primer elemento focusable dentro del contenedor principal de la landing (antes del Navbar).
- **Ejemplo:**  
  `<a href="#inicio" class="sr-only focus:not-sr-only ...">Saltar al contenido principal</a>`

### 4. Ocultar MouseFollower en móvil / touch

- **Problema:** En pantallas táctiles no hay “cursor” que seguir; el badge puede aparecer en posiciones raras o distraer.
- **Solución:** En `MouseFollower`, usar `enabled={!isTouchDevice}` con detección por `'ontouchstart' in window` o `matchMedia('(pointer: coarse)')`, para que solo se active en desktop.

---

## Prioridad media (UX y conversión)

### 5. Redes sociales en el footer

- **Problema:** Los enlaces sociales del footer usan `href="#"`.
- **Solución:** Cuando tengas las URLs reales (Facebook, Instagram, YouTube, etc.), sustituir en `components/footer.tsx` en el array `socialLinks`. Si alguna red no existe, mejor no mostrarla.

### 6. Newsletter o formulario de contacto

- **Qué:** Bloque en el footer (o sección propia) para captar emails o mensajes: “Recibe noticias” / “Escríbenos”.
- **Dónde:** Footer, debajo de “Quick Links” o en una tercera columna. Opcional: sección “Contacto” antes del footer.
- **Nota:** Requiere backend o servicio (ej. Resend, SendGrid, formulario tipo Formspree) para no dejar el formulario sin destino.

### 7. Sección de testimonios

- **Qué:** 3–6 frases cortas de pastores, alumnos o iglesias (nombre, rol, foto opcional).
- **Dónde:** Después de Misión o de Convenciones, para reforzar confianza antes del CTA de inscripción.
- **Implementación:** Componente tipo `TestimonialsSection` con datos en código o desde CMS/API, con diseño en cards o carrusel.

### 8. FAQ (preguntas frecuentes)

- **Qué:** 5–10 preguntas sobre convenciones, inscripción, pagos, fechas, sede.
- **Beneficio:** Menos dudas, mejor SEO (snippets en Google) y menos carga a soporte.
- **Dónde:** Después de Convenciones o antes del Footer. Componente con acordeón (una pregunta abierta a la vez).

### 9. Posición de FloatingCTA y BackToTop en móvil

- **Problema:** Ambos están abajo (izquierda y derecha) y pueden solaparse o tapar contenido en pantallas pequeñas.
- **Solución:** En móvil, bajar un poco el BackToTop (ej. `bottom-6`) o el FloatingCTA, o ocultar uno cuando el otro esté visible (p. ej. BackToTop solo cuando scroll > 60% de la página).

---

## Prioridad media (rendimiento y SEO)

### 10. Lazy load de secciones below-the-fold

- **Qué:** Cargar solo cuando la sección entra en viewport (o cerca) para reducir JS y tiempo de interacción.
- **Dónde:** Secciones como Galería, Educación, incluso Noticias/Convenciones si son pesadas.
- **Cómo:** `next/dynamic` con `ssr: false` para el componente de la sección y un wrapper que use Intersection Observer para mostrar contenido, o `loading.tsx` por ruta si divides en rutas más adelante.

### 11. Imágenes del hero y above-the-fold

- **Qué:** Hero y primeras secciones usan `next/image` con `priority` solo donde hay imagen “above the fold”; el resto con `loading="lazy"`.
- **Revisar:** Que las imágenes del hero (si las hay) tengan `priority` y buen `alt`; que el resto use lazy por defecto.

### 12. Open Graph y metadata específicos de la landing

- **Qué:** El layout ya tiene metadata global. Si la home es la landing principal, se puede exportar `metadata` (o `generateMetadata`) en `app/page.tsx` para título/descripción/OG específicos de “Inicio” o “Convenciones”.
- **Comprobar:** Que `og-image.jpg` exista en `public/` y sea ~1200×630 px.

### 13. Schema.org para eventos (convenciones)

- **Qué:** JSON-LD de tipo `Event` (o `EventSeries`) con nombre, fecha, lugar, URL de inscripción.
- **Dónde:** En la página de la landing (o en la página de convenciones si es otra ruta), en un `<script type="application/ld+json">` dentro del layout o del page. Ayuda a rich results en Google (fechas, “Inscribirse”, etc.).

---

## Prioridad baja (refinamiento)

### 14. Focus visible en navegación

- **Qué:** Estilo claro de `:focus-visible` en enlaces y botones del Navbar y del Footer para que se vea bien al navegar con teclado.
- **Dónde:** `globals.css` o clases de los componentes (ej. `focus-visible:ring-2 focus-visible:ring-offset-2`).

### 15. Etiquetas ARIA en secciones

- **Qué:** Dar a cada bloque principal `role="region"` y `aria-labelledby` (apuntando al título de la sección) para mejorar navegación por lectores de pantalla.
- **Ejemplo:**  
  `<section id="convenciones" role="region" aria-labelledby="convenciones-title">` y `<h2 id="convenciones-title">...</h2>`.

### 16. Botón o enlace de WhatsApp

- **Qué:** Flotante o en Navbar/Footer: “¿Necesitas ayuda? Escríbenos por WhatsApp”.
- **Dónde:** Footer junto a redes, o botón fijo tipo FloatingCTA pero secundario (sin tapar el CTA principal).

### 17. Breadcrumb en páginas internas (no en la landing)

- **Qué:** Solo si añades más páginas (ej. “Nuestra historia”, “Sedes”). En la home no suele hacer falta.
- **Nota:** Dejar para cuando existan rutas hijas.

---

## Resumen por prioridad

| Prioridad | Mejora |
|-----------|--------|
| Alta | 1. Quitar ScrollProgress duplicado |
| Alta | 2. Corregir enlace Hero "Conocer Más" (#nosotros → #mision) |
| Alta | 3. Enlace "Saltar al contenido" |
| Alta | 4. MouseFollower solo en desktop (no touch) |
| Media | 5. URLs reales redes sociales en footer |
| Media | 6. Newsletter o formulario de contacto |
| Media | 7. Sección testimonios |
| Media | 8. FAQ |
| Media | 9. Ajustar posición FloatingCTA / BackToTop en móvil |
| Media | 10. Lazy load secciones |
| Media | 11. Revisar priority/lazy en imágenes |
| Media | 12. Metadata/OG específicos landing |
| Media | 13. Schema.org Event (convenciones) |
| Baja | 14. Focus visible |
| Baja | 15. ARIA en secciones |
| Baja | 16. WhatsApp |
| Baja | 17. Breadcrumbs (solo páginas internas) |

Si quieres, se puede implementar primero el bloque de prioridad alta (1–4) en el código y dejar el resto como backlog.
