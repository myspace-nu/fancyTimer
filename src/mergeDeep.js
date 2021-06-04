export function isDate(value) {
	switch (typeof value) {
		case 'number':
			return true;
		case 'string':
			return !isNaN(Date.parse(value));
		case 'object':
			if (value instanceof Date) {
				return !isNaN(value.getTime());
			}
		default:
			return false;
	}
}
export function isObject(item) {
	return (item && typeof item === 'object' && !Array.isArray(item));
}
export default function mergeDeep(...objects) {
	const isObject = obj => obj && typeof obj === 'object';
	return objects.reduce((prev, obj) => {
		Object.keys(obj).forEach(key => {
			const pVal = prev[key];
			const oVal = obj[key];
			if (Array.isArray(pVal) && Array.isArray(oVal)) {
				prev[key] = pVal.concat(...oVal);
			}
			else if (isObject(pVal) && isObject(oVal)) {
				prev[key] = mergeDeep(pVal, oVal);
			}
			else {
				prev[key] = oVal;
			}
		});
		return prev;
	}, {});
}