import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

export default {
	input: "./src/index.ts",
	output: [
		// 1. cjs -> commonjs
		// 2. esm  标准化模块规范 是的浏览器最优化加载模块比库更有效率
		{
			format: "cjs",
			file: pkg.main,
		},
		{
			format: "esm",
			file: pkg.module,
		},

	],
	plugins: [
		typescript()
	]
}