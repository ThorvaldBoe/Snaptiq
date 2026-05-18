export interface BackgroundColorPreset {
  label: string;
  value: string;
}

export const transparentBackgroundValue = '';

export const backgroundColorPresets: BackgroundColorPreset[] = [
  { label: 'Transparent', value: transparentBackgroundValue },
  { label: 'Black', value: '#000000' },
  { label: 'White', value: '#FFFFFF' },
  { label: 'Red', value: '#FF0000' },
  { label: 'Blue', value: '#0000FF' },
  { label: 'Green', value: '#008000' },
  { label: 'Navy', value: '#000080' },
  { label: 'Military Green', value: '#4B5320' },
  { label: 'Sand', value: '#C2B280' },
  { label: 'Purple', value: '#800080' },
  { label: 'Lime', value: '#00FF00' },
  { label: 'Orange', value: '#FFA500' }
];

export function normalizeBackgroundColorInput(value: string): string | null {
  const trimmedValue = value.trim();

  if (trimmedValue === transparentBackgroundValue) {
    return transparentBackgroundValue;
  }

  const shortHexMatch = /^#([0-9a-f]{3})$/i.exec(trimmedValue);
  if (shortHexMatch) {
    const expandedHex = shortHexMatch[1]
      .split('')
      .map((character) => character + character)
      .join('')
      .toUpperCase();

    return `#${expandedHex}`;
  }

  if (/^#[0-9a-f]{6}$/i.test(trimmedValue)) {
    return trimmedValue.toUpperCase();
  }

  return null;
}
