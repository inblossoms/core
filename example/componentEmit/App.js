import { h } from '../../lib/guide-mini-vue.esm.js';
import { Foo } from './Foo.js';

export const App = {
	name: "App",
	render() {
		// emit
		return h("div", {}, [h("div", {}, "App"),
		h(Foo, {
			// on + Event
			onAdd(a, b) {
				console.log("onAdd", a, b);
			},

			onAddFoo() {
				console.log("AddFoo", a, b);
			}
		})])
	},

	setup() {
		return {}
	}
};
