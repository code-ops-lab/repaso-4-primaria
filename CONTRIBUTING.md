# Cómo contribuir

¡Gracias por querer ayudar! Este proyecto es gratuito y sirve a familias que repasan Primaria en casa. Las contribuciones más útiles son **preguntas nuevas** y **correcciones de las que ya hay**.

## Añadir o corregir preguntas

1. Las preguntas viven en [`src/data/paquete-base.json`](src/data/paquete-base.json). Formato en la [guía técnica](docs/GUIA-TECNICA.md#formato-de-un-paquete-de-preguntas).
2. Cada pregunta debería llevar:
   - `topic`: el bloque (por ejemplo «Ortografía» o «El cuerpo humano»),
   - `level`: de 1 (fácil) a 5 (difícil),
   - `e`: una explicación breve, clara para un niño de 9-10 años.
3. **Escribe preguntas originales.** No copies ejercicios de libros de texto, cuadernos ni fichas con derechos de autor.
4. Comprueba que la respuesta correcta es una de las opciones y que las opciones incorrectas son claramente incorrectas.
5. Abre una *pull request* explicando de qué curso y asignatura son.

## Otros cambios

- Prueba la app con `npm run dev` y compila con `npm run build` antes de abrir la *pull request*.
- Mantén la app **sin cuentas, sin anuncios y sin rastreadores**: no se admiten cambios que envíen datos de los niños a ningún servidor.
- Si vas a cambiar algo grande, abre antes un *issue* para comentarlo.

## Privacidad

No incluyas en el repositorio nombres reales de niños, capturas con datos personales ni documentos de colegios.
