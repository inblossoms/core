import { h } from '../../lib/guide-mini-vue.esm.js';
import ArrayToText from './ArrayToText.js';
// import ArrayToArray from './ArrayToArray.js';
import TextToArray from './TextToArray.js';
import TextToText from './TextToText.js';

export default {
	name: "App",
	setup() {

	},

	render() {
		return h(
			"div",
			{
				tId: 1,
			},
			[
				h("p", {}, "主页"),
				// 旧的是 array 新的是 text
				// h(ArrayToText),
				// 旧的是 array 新的是 array
				// h(ArrayToArray),
				// 旧的是 text 新的是 array
				h(TextToArray),
				// 旧的是 text 新的是 text
				// h(TextToText),
			]
		)
	},
}