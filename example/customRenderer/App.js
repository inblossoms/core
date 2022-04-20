import { h } from '../../lib/guide-mini-vue.esm.js';

export const App = {
	setup() {
		return {
			x: 200,
			y: 200
		}
	},

	render() {
		return h("rect", { x: this.x, y: this.y })
	}
}