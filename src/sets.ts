export const union = <T>(a: Set<T>, b: Set<T>) => new Set([...a, ...b]);
export const intersection = <T>(a: Set<T>, b: Set<T>) =>
	new Set([...a].filter((x) => b.has(x)));
export const difference = <T>(a: Set<T>, b: Set<T>) =>
	new Set([...a].filter((x) => !b.has(x)));
export const symmetric = <T>(a: Set<T>, b: Set<T>) =>
	union(difference(a, b), difference(b, a));
export const isSubsetOf = <T>(a: Set<T>, b: Set<T>) =>
	[...b].every((x) => a.has(x));
export const isSupersetOf = <T>(a: Set<T>, b: Set<T>) =>
	[...a].every((x) => b.has(x));
export const isDisjointFrom = <T>(a: Set<T>, b: Set<T>) =>
	!intersection(a, b).size;
