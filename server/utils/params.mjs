export function toIntParam(value) {
  const n = Number.parseInt(value, 10);//converte stringa in numero base decimale
  return Number.isFinite(n) ? n : null;
}