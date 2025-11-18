/**
 * Utilidades para etiquetas (Tag)
 * - Normalización determinista para evitar duplicados lógicos
 * - Alineado con las reglas de TAGS_STRATEGY del NUEVOPROMPT:
 *   - minúsculas
 *   - sin acentos
 *   - sin espacios (se reemplazan por guiones)
 */

export function normalizeTagLabel(raw: string): string {
  if (!raw) return "";

  // 1) trim + minúsculas
  let value = String(raw).trim().toLowerCase();
  if (!value) return "";

  // 2) eliminar acentos/diacríticos (ñ se mantiene como caracter propio)
  value = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 3) eliminar caracteres especiales, dejando letras, números, espacios y guiones
  value = value.replace(/[^a-z0-9\s-]/g, "");

  // 4) colapsar espacios múltiples a un solo espacio
  value = value.replace(/\s+/g, " ").trim();

  // 5) reemplazar espacios por guiones
  value = value.replace(/\s+/g, "-");

  // 6) limitar longitud máxima (defensivo)
  const MAX_LENGTH = 50;
  if (value.length > MAX_LENGTH) {
    value = value.slice(0, MAX_LENGTH);
  }

  return value;
}