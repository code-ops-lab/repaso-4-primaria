# Guía técnica

## Cómo está organizado

```
scripts/
  deploy-pages.mjs         publica la app en GitHub Pages (rama gh-pages)
src/
  App.jsx                  pantalla de inicio, tareas del día, reinicios, cambio de día
  components/
    Task.jsx               una tarea (10 preguntas), explicación al fallar
    ParentPanel.jsx        zona de padres (PIN)
    TopicsPanel.jsx        activar/desactivar temas
    Results.jsx            resultados de la semana y detalle por día
    PdfImport.jsx          subir PDF → ejercicios
    Calendar.jsx, Reward.jsx, Princess.jsx
  engine/
    subjects.js            asignaturas y temas generados (matemáticas, lengua, valenciano, inglés)
    math.js, math2.js, math3.js   generadores de cuentas y ejercicios de matemáticas
    daily.js               construcción de la tarea del día y temas activos
    hints.js               explicación, diagnóstico del error y truco al fallar
    packs.js               paquetes de preguntas (JSON) y paquete base
    pdfText.js, pdfSim.js, pdfQuestions.js   lectura de PDF y generación de ejercicios
    storage.js             guardado en el navegador, migraciones y sincronización entre ventanas
    calendar.js, active.js, adaptive.js, helpers.js
  data/
    paquete-base.json      preguntas incluidas (con tema y explicación)
    explain.js             explicaciones por palabra, reglas y trucos por tema
```

## Cómo se genera el contenido

- **Matemáticas**: generadores que producen cuentas nuevas sin límite, con 5 niveles por tema.
- **Resto de asignaturas**: preguntas de opción múltiple del paquete base y de los paquetes que se importen. Una pregunta acertada no vuelve a salir mientras queden otras sin hacer.
- **Temas**: los generadores y los bloques de preguntas (campo `topic`) se pueden activar o desactivar desde la zona de padres. Por defecto vienen desactivados «División con divisor de dos cifras» y los bloques de Conocimiento del Medio salvo «El cuerpo humano».

## Formato de un paquete de preguntas

Archivo `.json` que se importa desde la zona de padres:

```json
{
  "name": "Mi paquete",
  "questions": [
    {
      "subject": "lengua",
      "topic": "Ortografía",
      "level": 2,
      "q": "¿Cuál está bien escrita?",
      "o": ["huerto", "uerto"],
      "a": "huerto",
      "e": "Empieza por «hue-»: la h no suena pero se escribe."
    }
  ]
}
```

| Campo | Obligatorio | Descripción |
|---|---|---|
| `subject` | sí | `mates`, `lengua`, `valencia`, `ingles` o `medio` (`ciencias` se acepta y pasa a `medio`) |
| `level` | sí | 1 (fácil) a 5 (difícil) |
| `q` | sí | enunciado (máx. 200 caracteres) |
| `o` | sí | de 2 a 5 opciones distintas (máx. 60 caracteres cada una) |
| `a` | sí | la respuesta correcta: debe ser una de las opciones |
| `topic` | no | bloque al que pertenece; se puede activar o desactivar. Sin él, el bloque es el nombre del paquete |
| `e` | no | explicación breve que se muestra si falla esa pregunta |
| `t` | no | texto de lectura que se muestra encima de la pregunta |

Las preguntas inválidas o repetidas se ignoran y la app indica cuántas.

## PDF

El PDF se lee en el dispositivo con pdf.js (sin enviar nada a internet).

- **Operaciones (Matemáticas)**: detecta `a + b`, `a − b`, `a × b`, `a ÷ b`, guarda la «forma» de cada una (cifras, ceros finales, divisiones exactas o con resto) y genera operaciones nuevas del mismo estilo. Si el signo ÷ es un dibujo y no se lee, se puede forzar en la lista desplegable.
- **Preguntas con opciones** (`1. ¿…? a) … b) … c) …`): las detecta; si el PDF trae «Soluciones: 1-b 2-a…», marca la correcta.
- **Listas «palabra – palabra»**: una pregunta por pareja.
- **Textos**: frases «Completa: …» con la palabra clave oculta.

Todo sale como lista para revisar antes de añadirlo. No funciona con PDF escaneados como imagen.

## Publicar

### GitHub Pages

```bash
npm run deploy
```

Compila con la subruta del repositorio (`/<nombre-del-repositorio>/`, variable `VITE_BASE`) y sube `dist` a la rama `gh-pages` ([scripts/deploy-pages.mjs](../scripts/deploy-pages.mjs)). En **Settings → Pages** hay que elegir *Deploy from a branch* → `gh-pages` / `(root)`.

Si prefieres que se publique solo en cada `push`, copia [docs/github-pages-workflow.yml](github-pages-workflow.yml) a `.github/workflows/pages.yml` y elige **Source: GitHub Actions** en Settings → Pages. (Para subir archivos de flujos, el token de `gh` necesita el permiso `workflow`: `gh auth refresh -s workflow`.)

### Netlify u otro hosting estático

```bash
npm run build
```

y subir la carpeta `dist`. En la raíz del dominio no hace falta nada más.

### Compilar para una subruta a mano

```bash
VITE_BASE=/mi-ruta/ npm run build      # Linux / macOS / PowerShell: $env:VITE_BASE='/mi-ruta/'
```

(En Git Bash para Windows, usa `MSYS_NO_PATHCONV=1` delante para que no convierta la ruta.)

## Instalación como app y funcionamiento sin conexión

- Es una PWA: el service worker guarda la app, el lector de PDF y los iconos.
- Chrome en Android necesita iconos PNG de 192 y 512 px para ofrecer «Instalar app» (ya incluidos).
- Las actualizaciones se descargan solas cuando hay conexión y se aplican al volver al inicio, nunca en mitad de una tarea. La versión aparece al pie de la pantalla de inicio y en la zona de padres.

## Límites conocidos

- El PIN y el progreso viven en el navegador del dispositivo: frenan a un niño curioso, no a una persona con conocimientos técnicos. Si se olvida el PIN hay que borrar los datos del sitio (se pierde el progreso).
- El progreso no se sincroniza entre dispositivos.
- Los bancos de preguntas de lengua, valenciano, inglés y conocimiento del medio son una muestra y conviene ampliarlos.
- Las preguntas generadas desde PDF de texto (frases a completar) pueden quedar poco naturales: por eso siempre se revisan antes de añadirlas.
