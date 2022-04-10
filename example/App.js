
import { h } from '../../lib/guide-mini-vue.esm.js';

export const App = {

	// TODO
	// <template></template>  内部需要有编译能力

	render() {
		return h(
			"div",
			{
				id: "root", class: ["red", "hard"]
			},
			// "hi" + this.msg
			// "hi mini-Vue" // string
			// array
			[
				h("p", {
					class: "red"
				},
					"hi"
				),
				h("p", {
					class: "yellow"
				},
					"mini - vue"
				),

			]
		)
	},

	setup() {
		// composition api

		return {
			msg: "mini-vue"
		}
	}
}