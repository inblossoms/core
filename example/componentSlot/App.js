import { h } from '../../lib/guide-mini-vue.esm.js';
import { Foo } from './Foo.js';

export const App = {
	name: "App",
	render() {
		const app = h("div", {}, "App")
		// <div> <Foo> <p>123</p> </Foo> </div>
		// 支持 数组 vnode
		const foo = h(Foo, {}, h("p", {}, "123"))
		// const foo = h(Foo, {}, [h("p", {}, "123"), h("p", {}, "234")])

		return h("div", {}, [app, foo])
	},

	setup() {
		return {}
	}
};
