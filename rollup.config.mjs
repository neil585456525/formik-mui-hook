import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import del from 'rollup-plugin-delete'
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer(),
    nodeResolve(),
    del({ targets: 'dist/*' }),
    typescript({ tsconfig: "./tsconfig.build.json" }),
  ],
  external: ['formik', 'yup'],
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "esm"
  },
});
