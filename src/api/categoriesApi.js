import axiosClient from './axiosClient';

// Only cache public, slowly changing category data, in memory for five minutes.
const TTL = 5 * 60 * 1000;
let cached;
let expiresAt = 0;
let pending;
let generation = 0;

export function invalidateCategories() {
    generation += 1;
    cached = undefined;
    expiresAt = 0;
    pending = undefined;
}

export function getCategories() {
    if (cached && Date.now() < expiresAt) return Promise.resolve({ data: cached });
    if (pending) return pending;
    const currentGeneration = generation;
    const request = axiosClient.get('/categories/').then((response) => {
        if (currentGeneration === generation) {
            cached = Array.isArray(response.data) ? response.data : [];
            expiresAt = Date.now() + TTL;
        }
        return { data: Array.isArray(response.data) ? response.data : [] };
    }).finally(() => {
        if (pending === request) pending = undefined;
    });
    pending = request;
    return request;
}
