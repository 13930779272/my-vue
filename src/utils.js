export function isFunction (data) {
  return typeof data == 'function'
}
export function isObject(data) {
  return typeof data == 'object' && data !== null;
}
export let isArray = Array.isArray