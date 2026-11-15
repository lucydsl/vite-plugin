import { readFile, writeFile } from 'node:fs/promises';
import { ready, compile } from '@lucy/liblucy';

// Ids that end in .lucy. An id with a query (?raw, ?url) is some other
// plugin's to handle, so it doesn't match.
const lucyId = /\.lucy$/;

/**
 * A Vite plugin that compiles .lucy files to JavaScript modules.
 * @param options {{ dts?: boolean }}
 * @returns {import('vite').Plugin}
 */
export default function lucy(options = {}) {
  const dts = options.dts ?? true;

  return {
    name: 'lucy',

    transform: {
      // Vite and Rolldown check the filter before calling the handler, so
      // other modules never reach the plugin's JavaScript.
      filter: { id: lucyId },
      async handler(source, id) {
        // Hosts older than hook filters (Vite before 6.3) call the handler
        // for every module.
        if(!lucyId.test(id)) {
          return null;
        }

        await ready;

        let out;
        try {
          // liblucy before 0.7 only made the declarations when asked.
          out = compile(source, id);
        } catch(err) {
          const error = err.diagnostics?.find(d => d.severity === 'error');
          if(!error) {
            throw err;
          }
          this.error({
            message: error.message,
            id,
            loc: { file: id, line: error.line, column: error.column }
          });
        }

        if(dts) {
          await writeDeclarations(id, out.dts);
        }

        return {
          code: out.js,
          map: { mappings: '' },
          // Rolldown picks a module's type from its extension, and has
          // none for .lucy.
          moduleType: 'js'
        };
      }
    }
  };
}

// TypeScript reads the types of toggle.lucy from toggle.lucy.d.ts, with
// its allowArbitraryExtensions option. The file is left alone when it's
// already right, so that nothing watching it sees a change.
async function writeDeclarations(id, text) {
  const file = id.replace(lucyId, '.lucy.d.ts');
  const current = await readFile(file, 'utf8').catch(() => null);
  if(current !== text) {
    await writeFile(file, text);
  }
}
