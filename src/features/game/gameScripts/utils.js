export function randBetween(a, b) {
    return a + Math.random() * (b - a);
}

/**
 * Picks a key from a weights object using weighted random selection.
 * @param {{ [key: string]: number }} weights
 * @returns {string}
 */
export function weightedRandom(weights) {
    const entries = Object.entries(weights);
    if (entries.length === 0) {
        throw new Error('weightedRandom: weights object must not be empty');
    }

    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);

    if (total <= 0) {
        throw new Error('weightedRandom: total weight must be greater than 0');
    }

    let rand = Math.random() * total;
    for (const [key, weight] of entries) {
        rand -= weight;
        if (rand <= 0) return key;
    }
    return entries[entries.length - 1][0];
}
