import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/api/categoriesApi.js', import.meta.url), 'utf8')
    .replace(/^import axiosClient .*;\r?\n/m, '')
    .replaceAll('export function ', 'function ');

function setup(get) {
    let now = 0;
    const api = vm.runInNewContext(`${source}\n({ getCategories, invalidateCategories });`, {
        axiosClient: { get }, Date: { now: () => now },
    });
    return { ...api, advance: (ms) => { now += ms; } };
}

test('concurrent category consumers share one request and reuse the result', async () => {
    let calls = 0;
    let finish;
    const data = [{ id: 1, name: 'Category' }];
    const api = setup(() => { calls++; return new Promise(resolve => { finish = resolve; }); });
    const first = api.getCategories();
    const second = api.getCategories();
    assert.equal(first, second);
    finish({ data });
    await first;
    assert.equal((await api.getCategories()).data, data);
    assert.equal(calls, 1);
});

test('categories expire after five minutes, including an empty category list', async () => {
    let calls = 0;
    const api = setup(async () => { calls++; return { data: [] }; });
    await api.getCategories();
    api.advance(299999);
    await api.getCategories();
    assert.equal(calls, 1);
    api.advance(1);
    await api.getCategories();
    assert.equal(calls, 2);
});

test('failed requests can be retried', async () => {
    let calls = 0;
    const api = setup(async () => {
        if (++calls === 1) throw new Error('offline');
        return { data: [{ id: 2 }] };
    });
    await assert.rejects(api.getCategories(), /offline/);
    assert.equal((await api.getCategories()).data[0].id, 2);
    assert.equal(calls, 2);
});

test('admin invalidation fetches new categories immediately', async () => {
    let calls = 0;
    const api = setup(async () => ({ data: [{ id: ++calls }] }));
    await api.getCategories();
    api.invalidateCategories();
    assert.equal((await api.getCategories()).data[0].id, 2);
});

test('a response started before invalidation cannot overwrite the new cache', async () => {
    const resolvers = [];
    const api = setup(() => new Promise(resolve => resolvers.push(resolve)));
    const oldRequest = api.getCategories();
    api.invalidateCategories();
    const newRequest = api.getCategories();
    resolvers[1]({ data: [{ id: 'new' }] });
    await newRequest;
    resolvers[0]({ data: [{ id: 'old' }] });
    await oldRequest;
    assert.equal((await api.getCategories()).data[0].id, 'new');
    assert.equal(resolvers.length, 2);
});
