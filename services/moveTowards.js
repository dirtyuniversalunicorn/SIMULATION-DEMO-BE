import { WS_CONFIG } from "../ws.config.js";
/**
 * Move from `position` towards `destination` by `speed`.
 * @param {[number, number]} position - [lat, lng]
 * @param {[number, number]} destination - [lat, lng]
 * @param {number} speed - units per tick
 * @returns {[number, number]} new position
 */
export function moveTowards(position, destination, speed) {
  const [lat, lng] = position;
  const [dLat, dLng] = destination;

  const dx = dLat - lat;
  const dy = dLng - lng;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) return position;

  const step = speed * WS_CONFIG.MAP_SCALE;

  if (distance <= step) return [dLat, dLng];

  return [lat + (dx / distance) * step, lng + (dy / distance) * step];
}
