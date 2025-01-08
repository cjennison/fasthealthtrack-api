// Takes any string and normalizes it for use in keys by
//  first, converting the string to lowercase,
//  second, convert all spaces to hyphens,
export const normalizeString = (str: string): string => {
  return str.toLowerCase().replace(/\s/g, '-');
};
