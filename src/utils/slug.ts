// Centralized slug builder for datasets (and potentially other entities)
// Ensures consistent, URL-friendly slugs capped at 60 chars before appending the id.

export function buildSlug(entity: { id: string | number; name?: string | null }) {
  const rawName = (entity.name || 'dataset')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
  return `${rawName}-${entity.id}`;
}

export default buildSlug;
