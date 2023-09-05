export function parseBoolean(
	value: string | string[] | undefined | null
): boolean {
	if (value == undefined) return false;
	if (Array.isArray(value)) return false;
	value = value.toLowerCase();
	return value === 'true' || value === '1' || value === 'yes';
}

export function classNames(...classes: (string | undefined)[]): string {
	return classes.filter(Boolean).join(' ');
}