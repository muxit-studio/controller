import {LitElement, html} from "lit";
import {findElements} from "./query";
import {parseAttributes} from "./attributes";

export type Action = {
	type: string;
	controller: string;
	method: string;
};

export class Controller extends LitElement {
	#handlers = new WeakMap<Element, ((e: Event) => void)[]>();
	#observer: MutationObserver;

	constructor() {
		super();
		this.#observer = new MutationObserver(() => {
			this.#cleanupActions(); // Clean up existing listeners
			this.#listenActions(); // Add new listeners
		});
	}

	connectedCallback() {
		super.connectedCallback();

		// Initial setup
		this.#listenActions();

		// Start observing changes
		this.#observer.observe(this, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ["data-action", "data-query", "data-target", "data-trigger"]
		});
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		// Clean up existing listeners
		this.#cleanupActions();
		// Stop observing
		this.#observer.disconnect();
	}

	render() {
		return html`<slot />`;
	}

	eventDetail<T extends Record<string, any>>(event: CustomEvent<T> | Event): Partial<T> {
		// handle customevent
		if (event instanceof CustomEvent && event.detail) {
			return event.detail;
		}

		// handle data attributes
		const target = event.target as HTMLElement;
		if (!target) return {};

		return parseAttributes<T>(target);
	}

	#parseActions(actionString: string): Action[] {
		if (!actionString) return [];

		return actionString
			.trim()
			.split(/\s+/) // Split multiple actions defined in the string
			.map((action) => {
				// 1. Find the method separator first
				const hashIndex = action.indexOf("#");
				let eventAndControllerPart: string;
				let method: string;

				if (hashIndex === -1) {
					// No '#' found, method defaults to 'handleEvent'
					eventAndControllerPart = action;
					method = "handleEvent";
				} else {
					eventAndControllerPart = action.substring(0, hashIndex);
					method = action.substring(hashIndex + 1) || "handleEvent";
				}

				// 2. Find the LAST colon in the remaining part to separate event type from controller
				const lastColonIndex = eventAndControllerPart.lastIndexOf(":");

				// Check if a colon exists and separates non-empty parts
				if (lastColonIndex <= 0 || lastColonIndex === eventAndControllerPart.length - 1) {
					console.warn(
						`[Controller] Invalid action format: Could not determine event and controller in "${action}". Skipping.`
					);
					return null; // Invalid format
				}

				const eventType = eventAndControllerPart.substring(0, lastColonIndex);
				const controller = eventAndControllerPart.substring(lastColonIndex + 1);

				// Final validation
				if (!eventType || !controller || !method) {
					console.warn(`[Controller] Invalid action format: Empty parts detected in "${action}". Skipping.`);
					return null;
				}

				return {type: eventType, controller, method};
			})
			.filter((action): action is Action => action !== null);
	}

	#handleAction(event: Event, element: Element, action: Action) {
		// look for the nearest controller matching the action's controller name
		const controller = element.closest<HTMLElement>(action.controller);
		if (!controller) {
			console.warn(`Controller ${action.controller} not found`);
			return;
		}

		// the method should exist on the controller, not the element
		const method = (controller as any)[action.method];
		if (typeof method !== "function") {
			console.warn(`Method ${action.method} not found on controller ${action.controller}`);
			return;
		}

		method.call(controller, event);
	}

	#listenActions() {
		findElements<HTMLElement>(this, "[data-action]").forEach((element) => {
			const actionString = element.dataset.action;
			if (!actionString) return;

			const handlers: ((e: Event) => void)[] = [];

			for (const action of this.#parseActions(actionString)) {
				if (action.controller !== this.tagName.toLowerCase()) continue;

				const handler = (event: Event) => this.#handleAction(event, element, action);

				element.addEventListener(action.type, handler);
				handlers.push(handler);
			}

			if (handlers.length) {
				this.#handlers.set(element, handlers);
			}
		});
	}

	#cleanupActions() {
		findElements<HTMLElement>(this, "[data-action]").forEach((element) => {
			const handlers = this.#handlers.get(element);
			if (!handlers) return;

			const actionString = element.dataset.action;
			if (!actionString) return;

			for (const action of this.#parseActions(actionString)) {
				handlers.forEach((handler) => {
					element.removeEventListener(action.type, handler);
				});
			}
		});

		this.#handlers = new WeakMap(); // Reset handlers map
	}
}
