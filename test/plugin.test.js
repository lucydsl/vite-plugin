import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build, createServer } from 'vite';
import lucy from '@lucy/vite';

const root = fileURLToPath(new URL('./fixture/', import.meta.url));
const declarations = new URL('./fixture/toggle.lucy.d.ts', import.meta.url);

// Every compile of toggle.lucy writes its declarations.
after(() => rm(declarations, { force: true }));

function config(entry, options) {
  return {
    root,
    configFile: false,
    logLevel: 'silent',
    plugins: [lucy(options)],
    build: {
      write: false,
      lib: { entry, formats: ['es'] }
    }
  };
}

// The built bundle's code, as a module.
async function load(result) {
  const [{ output }] = [result].flat();
  const code = output[0].code;
  return import(`data:text/javascript,${encodeURIComponent(code)}`);
}

test('a build compiles .lucy imports', async () => {
  const { run } = await load(await build(config('main.js')));
  assert.deepEqual(run(), ['off', 'on']);
});

test('a .lucy file can be the entry', async () => {
  const { createToggle } = await load(await build(config('toggle.lucy')));
  assert.equal(createToggle().state, 'off');
});

test('the dev server serves .lucy files as JavaScript', async () => {
  const server = await createServer({
    ...config('main.js'),
    server: { middlewareMode: true, ws: false, watch: null }
  });
  try {
    const { code } = await server.environments.client.transformRequest('/toggle.lucy');
    assert.match(code, /export function createToggle\(/);
  } finally {
    await server.close();
  }
});

// The compiler prints the error itself as well, so it shows in the test
// output.
test('a compile error names the file and the line', async () => {
  await assert.rejects(build(config('broken.lucy')), err => {
    // Rolldown collects a build's errors; Rollup throws the first.
    const error = err.errors?.[0] ?? err;
    assert.equal(error.plugin, 'lucy');
    assert.match(err.message, /Unexpected identifier/);
    assert.match(error.id, /broken\.lucy$/);
    assert.equal(error.loc.line, 5);
    return true;
  });
});

test('the declarations are written beside the source', async () => {
  await rm(declarations, { force: true });
  await build(config('toggle.lucy'));
  assert.match(await readFile(declarations, 'utf8'), /export function createToggle</);
});

test('dts: false writes no declarations', async () => {
  await rm(declarations, { force: true });
  await build(config('toggle.lucy', { dts: false }));
  await assert.rejects(readFile(declarations), { code: 'ENOENT' });
});
