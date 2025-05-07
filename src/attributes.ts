export function parseAttributes<T extends Record<string, any>>(element: HTMLElement): Partial<T> {
	const result: Partial<T> = {};

	for (const [key, value] of Object.entries(element.dataset)) {
		(result as any)[key] = parseValue(value!);
	}

	return result;
}

const NUMBER_REGEX = /^\d+$/;

function parseValue(value: string): any {
	if (value === "true") return true;
	if (value === "false") return false;
	if (NUMBER_REGEX.test(value)) return Number(value);

	const firstChar = value[0];
	if (firstChar === "{" || firstChar === "[") {
		try {
			return JSON.parse(value);
		} catch {
			// fall through to other parsing
		}
	}

	if (value.includes(",")) {
		return value.split(",").map((v) => v.trim());
	}

	return value;
}
