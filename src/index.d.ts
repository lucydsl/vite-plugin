import type { Plugin } from 'vite';

export interface LucyOptions {
  /**
   * Write TypeScript declarations beside each .lucy file as it is
   * compiled: toggle.lucy gets toggle.d.lucy.ts. TypeScript reads them
   * when its allowArbitraryExtensions option is on. Experimental.
   */
  dts?: boolean;
}

/** A Vite plugin that compiles .lucy files to JavaScript modules. */
export default function lucy(options?: LucyOptions): Plugin;
