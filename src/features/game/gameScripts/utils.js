export function randBetween(a, b) {
    return a + Math.random() * (b - a);
}

/**
 * Picks a key from a weights object using weighted random selection.
 * @param {{ [key: string]: number }} weights
 * @returns {string}
 */
export function weightedRandom(weights) {
    const total = Object.values(weights).reduce((s, w) => s + w, 0);
    let rand = Math.random() * total;
    for (const [key, weight] of Object.entries(weights)) {
        rand -= weight;
        if (rand <= 0) return key;
    }
    return Object.keys(weights)[Object.keys(weights).length - 1];
}
