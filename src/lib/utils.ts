import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function isEmailProcessableFromText(body: string): boolean {
  if (!body) {
    return false;
  }

  let text = body.trim();

  if (!text) {
    return false;
  }

  // Si parece HTML, eliminamos tags y normalizamos espacios
  if (/<[^>]+>/.test(text)) {
    text = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  if (!text) {
    return false;
  }

  // Regla 3: si el contenido son solo URLs, no es procesable
  const onlyUrlsPattern = /^(https?:\/\/[^\s]+\s*)+$/i;
  if (onlyUrlsPattern.test(text)) {
    return false;
  }

  // Regla 2: longitud mínima de caracteres significativos (sin espacios)
  const textWithoutSpaces = text.replace(/\s+/g, "");
  if (textWithoutSpaces.length < 20) {
    return false;
  }

  // En cualquier otro caso, consideramos el email procesable
  return true;
}
