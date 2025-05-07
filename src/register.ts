export const slugify = (str: unknown): string =>
  String(typeof str === "symbol" ? str.description : str)
    .replace(/([A-Z]($|[a-z]))/g, "-$1")
    .replace(/--/g, "-")
    .replace(/^-|-$/, "")
    .toLowerCase();

export function register<T extends CustomElementConstructor>(
  classObject: T
): T {
  const name = slugify(classObject.name).replace(/-element$/, "");

  try {
    window.customElements.define(name, classObject);
    // @ts-ignore
    window[classObject.name] = customElements.get(name);
  } catch (e: unknown) {
    // The only reason for window.customElements.define to throw a `NotSupportedError`
    // is if the element has already been defined.
    if (!(e instanceof DOMException && e.name === "NotSupportedError")) throw e;
  }
  return classObject;
}
