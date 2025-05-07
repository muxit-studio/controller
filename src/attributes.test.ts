import {assert} from "@open-wc/testing";
import {parseAttributes} from "./attributes";

describe("parseAttributes", () => {
	let element: HTMLElement;

	beforeEach(() => {
		element = document.createElement("div");
	});

	test("parses string attributes", () => {
		element.setAttribute("data-url", "/products");
		assert.deepStrictEqual(parseAttributes(element), {url: "/products"});
	});

	test("parses boolean attributes", () => {
		element.setAttribute("data-active", "true");
		element.setAttribute("data-disabled", "false");
		assert.deepStrictEqual(parseAttributes(element), {
			active: true,
			disabled: false
		});
	});

	test("parses number attributes", () => {
		element.setAttribute("data-count", "42");
		assert.deepStrictEqual(parseAttributes(element), {count: 42});
	});

	test("parses array attributes", () => {
		element.setAttribute("data-tags", "one,two,three");
		assert.deepStrictEqual(parseAttributes(element), {
			tags: ["one", "two", "three"]
		});
	});

	test("parses JSON attributes", () => {
		element.setAttribute("data-config", '{"foo": "bar", "num": 123}');
		assert.deepStrictEqual(parseAttributes(element), {
			config: {foo: "bar", num: 123}
		});
	});

	test("handles kebab-case attributes", () => {
		element.setAttribute("data-user-name", "John");
		element.setAttribute("data-last-login-date", "2024-01-21");
		assert.deepStrictEqual(parseAttributes(element), {
			userName: "John",
			lastLoginDate: "2024-01-21"
		});
	});

	test("ignores non-data attributes", () => {
		element.setAttribute("id", "test");
		element.setAttribute("data-name", "John");
		assert.deepStrictEqual(parseAttributes(element), {name: "John"});
	});
});
