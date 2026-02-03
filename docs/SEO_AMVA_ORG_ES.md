# SEO para amva.org.es

## Configuración aplicada

### 1. Metadata principal
- **URL canónica**: `https://amva.org.es` (sin www)
- **Título**: AMVA - Asociación Misionera Vida Abundante | Ministerio Internacional
- **Descripción**: Formación pastoral, convenciones, instituto bíblico y escuela de capellanía
- **Keywords**: AMVA, ministerio misionero, formación pastoral, convenciones, etc.

### 2. Open Graph y Twitter Cards
- Imagen social: `/mundo.png`

### 3. Structured Data (JSON-LD)
- **Organization**: Nombre, logo, descripción
- **WebSite**: Para rich results en Google

### 4. Sitemap
- Incluye: `/`, `/noticias`, `/equipo`, `/galeria`, `/convencion/inscripcion`, `/mi-cuenta`
- URL: `https://amva.org.es/sitemap.xml`

### 5. Canonical por página
- Homepage: `https://amva.org.es`
- Noticias: `https://amva.org.es/noticias`
- Equipo: `https://amva.org.es/equipo`
- Galería: `https://amva.org.es/galeria`
- Inscripción: `https://amva.org.es/convencion/inscripcion`

## Variable de entorno

En el servidor (`/var/www/amva-production/.env.local`):

```env
NEXT_PUBLIC_SITE_URL=https://amva.org.es
```

**Importante**: Tras cambiar esta variable, hay que **reconstruir** el frontend (`npm run build`).

## www vs non-www

Para consolidar el SEO, se recomienda redirigir `www.amva.org.es` → `amva.org.es` en Nginx. Así Google indexa una sola URL.

## Verificación

1. **Google Search Console**: Añadir propiedad para `https://amva.org.es`
2. **Rich Results Test**: https://search.google.com/test/rich-results
3. **Open Graph**: https://www.opengraph.xyz/
