// Shared helpers.
export let CALM = false;
try { CALM = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
export function cssVar(el, name) { return getComputedStyle(el).getPropertyValue(name).trim(); }
