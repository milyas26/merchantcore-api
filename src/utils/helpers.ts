export const generateSlug = (name: string) => {
    // add random string and number to slug at the end
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .concat(`-${Math.random().toString(36).substring(2, 5)}`);
};