import type { Plugin } from 'vite';

export interface LucyOptions {
  /**
   * Write TypeScript declarations beside each .lucy file as it is
   * compiled: toggle.lucy gets toggle.lucy.d.ts, which types imports of
   * './toggle.lucy'. On by default; false turns it off.
   */
  dts?: boolean;
}

/** A Vite plugin that compiles .lucy files to JavaScript modules. */
export default function lucy(options?: LucyOptions): Plugin;
