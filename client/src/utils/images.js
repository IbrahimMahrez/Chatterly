export function getImageUrl(path) {
  if (!path) return null;
  const normalizedPath = path.replace(/\\/g, '/');
  if (normalizedPath.includes('default_profile_picture')) return null;
  if (normalizedPath.startsWith('http')) return normalizedPath;

  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  if (normalizedPath.startsWith('/')) return `${base}${encodeURI(normalizedPath)}`;
  if (normalizedPath.startsWith('images/')) return `${base}/${encodeURI(normalizedPath)}`;
  if (normalizedPath.startsWith('../images/')) {
    return `${base}/images/${encodeURI(normalizedPath.slice('../images/'.length))}`;
  }
  return `${base}/images/${encodeURI(normalizedPath)}`;
}
