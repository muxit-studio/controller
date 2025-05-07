import type { ReactiveElement } from "lit";
import type { Controller } from "./controller";

export function findElements<T extends Element>(
  controller: HTMLElement,
  query: string
): T[] {
  const tag = controller.tagName.toLowerCase();
  const elements: T[] = [];

  // search shadow dom
  if (controller.shadowRoot) {
    const shadowElements = controller.shadowRoot.querySelectorAll(query);
    for (let i = 0; i < shadowElements.length; i++) {
      const el = shadowElements[i];
      if (!el.closest(tag)) {
        elements.push(el as T);
      }
    }
  }

  // search light dom
  const lightElements = controller.querySelectorAll(query);
  for (let i = 0; i < lightElements.length; i++) {
    const el = lightElements[i];
    if (el.closest(tag) === controller) {
      elements.push(el as T);
    }
  }

  return elements;
}

export function queryAll(target: Controller, propertyKey: string) {
  const ctor = target.constructor as typeof ReactiveElement;

  ctor.addInitializer((instance: ReactiveElement) => {
    const getter = function (this: HTMLElement) {
      const controller = this.tagName.toLowerCase();
      const query = `[data-query~="${controller}.${propertyKey}"]`;
      return findElements(this, query);
    };

    Object.defineProperty(instance, propertyKey, {
      get: getter,
      enumerable: true,
      configurable: true,
    });
  });
}

export function query(target: Controller, propertyKey: string) {
  const ctor = target.constructor as typeof ReactiveElement;

  ctor.addInitializer((instance: ReactiveElement) => {
    const getter = function (this: HTMLElement) {
      const controller = this.tagName.toLowerCase();
      const query = `[data-query~="${controller}.${propertyKey}"]`;
      return findElements(this, query)?.[0];
    };

    Object.defineProperty(instance, propertyKey, {
      get: getter,
      enumerable: true,
      configurable: true,
    });
  });
}


export function target(target: Controller, propertyKey: string) {
  const ctor = target.constructor as typeof ReactiveElement;

  ctor.addInitializer((instance: ReactiveElement) => {
    const getter = function (this: HTMLElement) {
      const controller = this.tagName.toLowerCase();
      const query = `[data-target~="${controller}.${propertyKey}"]`;
      return findElements(this, query)?.[0];
    };

    Object.defineProperty(instance, propertyKey, {
      get: getter,
      enumerable: true,
      configurable: true,
    });
  });
}

export function targets(target: Controller, propertyKey: string) {
	const ctor = target.constructor as typeof ReactiveElement;

	ctor.addInitializer((instance: ReactiveElement) => {
		const getter = function (this: HTMLElement) {
			const controller = this.tagName.toLowerCase();
			const query = `[data-target~="${controller}.${propertyKey}"]`;
			return findElements(this, query);
		};

		Object.defineProperty(instance, propertyKey, {
			get: getter,
			enumerable: true,
			configurable: true,
		});
	});
}
