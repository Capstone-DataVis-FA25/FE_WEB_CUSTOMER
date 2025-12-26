const shortNamePreview = (name = '') => {
  return name
    .trim()
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

export default shortNamePreview;
