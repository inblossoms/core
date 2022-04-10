
import { h } from '../../lib/guide-mini-vue.esm.js';

export const App = {

	// TODO
	// <template></template>  内部需要有编译能力

	render() {
		return h("div", "hi" + this.msg)
	},

	setup() {
		// composition api

		return {
			msg: "mini-vue"
		}
	}
}