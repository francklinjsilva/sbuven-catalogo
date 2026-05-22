/**
 * Limpia el texto de descripción que viene del Google Sheet / products.json.
 *
 * El problema: las descripciones originales tienen una mezcla de:
 *   - Saltos de línea reales  (\n)
 *   - Saltos de línea literales como texto  (la cadena \n de dos caracteres)
 *   - Metadata embebida al final (Editorial:, Autor:, ISBN:, etc.)
 *
 * Esta función produce un texto legible listo para mostrar o editar.
 */
export function cleanDescription(raw: string | undefined | null): string {
  if (!raw) return "";

  return (
    raw
      // 1. Reemplazar los \n literales (dos chars: \ + n) por saltos reales
      .replace(/\\n/g, "\n")

      // 2. Eliminar líneas que solo contienen espacios, tabs o están vacías
      //    después de la limpieza anterior
      .split("\n")
      .map((line) => line.trim())

      // 3. Quitar la sección de metadatos embebida al final
      //    (comienza cuando aparece "Editorial:", "Autor:", "ISBN:", etc. solos en una línea)
      .reduce<{ lines: string[]; stop: boolean }>(
        (acc, line) => {
          if (acc.stop) return acc;
          // Detectar inicio del bloque de metadatos embebidos
          if (/^(Editorial|Autor|Autora|Fecha de publicaci[oó]n|Edici[oó]n|Idioma|N[°º]\s*p[aá]ginas|P[aá]ginas|Encuadernaci[oó]n|Dimensiones|ISBN)\s*:/i.test(line)) {
            acc.stop = true;
            return acc;
          }
          acc.lines.push(line);
          return acc;
        },
        { lines: [], stop: false }
      ).lines

      // 4. Colapsar más de dos líneas vacías consecutivas en una sola
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}
