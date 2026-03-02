# Pizarra Claustro Criminología

Aplicación web para organizar proyectos en pizarras separadas, con nodos visuales conectables sobre un lienzo infinito.

## Funcionalidades

- Título visible de producto: **Pizarra de Claustro**.
- Pizarras múltiples (una por proyecto).
- Elementos: nota, imagen, video/enlace y línea de tiempo.
- Línea de tiempo con formulario para múltiples eventos/periodos con fecha.
- Redimensionado manual de nodos (drag en esquina inferior derecha).
- Redimensionado de pildoras de **notas** y **timeline** con botones `A-` / `A+`.
- Cambio de color de pildoras con botón `🎨` y paleta sencilla de colores.
- Edición directa en vivo de notas y pildoras del timeline (evento/periodo).
- Conexiones rectas entre nodos (modo **Conectar**).
- Importación de **JSON y TSV** desde el botón `Importar JSON/TSV` (pegado directo).
- Exportación de JSON de la pizarra activa (descarga de archivo `.json`).
- Pan (`Shift + arrastrar`) y zoom (rueda).
- Botón de deshacer (`↶ Deshacer`) para revertir la última acción.
- Persistencia robusta en `localStorage` (incluye guardado al salir/ocultar pestaña y compatibilidad con claves previas).
- Respaldo por archivo JSON (`Guardar archivo` / `Cargar archivo`) para conservar pizarras entre navegadores/usuarios.
- Se eliminó el respaldo manual por código de texto para simplificar el flujo.
- Primera carga: si no hay datos guardados en `localStorage`, la app inicia con la pizarra `Criminología · Esquema UMBRAL (sin asignaturas) · v5` desde `default-board.json`.

## Ejecutar

```bash
python3 -m http.server 4173
```

Luego visita `http://localhost:4173`.


## Guardar en Google Drive (Google Sites)

Puedes conectar la app a un **Web App de Google Apps Script** que guarde/cargue el JSON en tu Drive:

- Pega la URL del Web App en `URL Web App (Apps Script)`.
- Usa **Guardar en Drive** y **Cargar de Drive**.
- El webhook se recuerda en el navegador (`pizarra-drive-webhook`).

> Nota: En Google Sites normalmente necesitas desplegar el Web App con permisos adecuados y CORS habilitado.
