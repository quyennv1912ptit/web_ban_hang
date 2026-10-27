import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import { transformWithOxc } from 'vite';

// Exercise provider data operations with controlled hooks and API responses.
const source = readFileSync(new URL('../src/contexts/CartContext.jsx', import.meta.url), 'utf8')
    .replace(/^import .*;\r?\n/gm, '').replaceAll('export const ', 'const ');
const { code } = await transformWithOxc(source, 'CartContext.jsx', { jsx: { runtime: 'classic' } });

function setup(get) {
    const slots = [];
    const effects = [];
    let cursor = 0;
    let authListener;
    const calls = [];
    const auth = {
        currentUser: { uid: 'buyer', getIdToken: async () => 'token' },
        onAuthStateChanged: listener => { authListener = listener; return () => {}; },
    };
    const axiosClient = Object.fromEntries(['get', 'post', 'put', 'delete'].map(method => [method, async (url, data) => {
        calls.push({ method, url, data });
        if (method === 'get') return get(url);
        if (method === 'put') return { data: { product_id: url.split('/').at(-1), quantity: data.quantity } };
        return { data: {} };
    }]));
    const Provider = vm.runInNewContext(`${code}\nCartProvider;`, {
        React: { createElement: (_type, props) => props.value },
        createContext: () => ({ Provider: 'Provider' }),
        useContext: () => {},
        useState: initial => {
            const index = cursor++;
            if (!(index in slots)) slots[index] = initial;
            return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
        },
        useRef: initial => {
            const index = cursor++;
            if (!(index in slots)) slots[index] = { current: initial };
            return slots[index];
        },
        useCallback: callback => callback,
        useEffect: effect => { const index = cursor++; if (!(index in slots)) { slots[index] = true; effects.push(effect); } },
        useLayoutEffect: effect => { cursor++; effect(); },
        useLocation: () => ({ pathname: '/' }),
        axiosClient, auth, console,
        toast: { success() {}, error() {}, warning() {}, info() {} },
    });
    const render = () => { cursor = 0; return Provider({ children: null }); };
    render();
    effects.forEach(effect => effect());
    return { render, calls, auth, emitAuth: user => { auth.currentUser = user; authListener(user); } };
}

const tick = () => new Promise(resolve => setImmediate(resolve));
const cartData = [{ product_id: 'p1', quantity: 2 }, { product_id: 'p2', quantity: 1 }];
const get = async url => ({ data: url === '/cart/' ? cartData : { id: url.split('/').at(-1), price: 100 } });

test('storefront cart badge loads quantities without fetching each product', async () => {
    const app = setup(get);
    app.emitAuth(app.auth.currentUser);
    await tick();
    assert.equal(app.render().totalQuantity, 3);
    assert.deepEqual(app.calls.map(call => call.url), ['/cart/']);
});

test('opening the cart hydrates products and coalesces concurrent refreshes', async () => {
    const app = setup(get);
    const cart = app.render();
    const first = cart.fetchCart();
    const second = cart.fetchCart();
    assert.equal(first, second);
    await first;
    assert.equal(app.render().totalPrice, 300);
    assert.equal(app.calls.length, 3);
});

test('quantity update and removal do not reload the cart or product details', async () => {
    const app = setup(get);
    await app.render().fetchCart();
    app.calls.length = 0;
    await app.render().updateQuantity('p1', 4);
    assert.equal(app.render().totalQuantity, 5);
    assert.equal(app.render().totalPrice, 500);
    await app.render().removeFromCart('p2');
    assert.equal(app.render().totalQuantity, 4);
    assert.deepEqual(app.calls.map(call => call.method), ['put', 'delete']);
});

test('a cart response arriving after logout cannot restore the previous cart', async () => {
    let finish;
    const app = setup(() => new Promise(resolve => { finish = resolve; }));
    const pending = app.render().fetchCart();
    app.emitAuth(null);
    finish({ data: cartData });
    await pending;
    assert.equal(app.render().totalQuantity, 0);
    assert.equal(app.calls.length, 1);
});
