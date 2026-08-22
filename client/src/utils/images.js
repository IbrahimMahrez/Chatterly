export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;

  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  if (path.startsWith('/')) return `${base}${path}`;
  return `${base}/images/${path}`;
}
