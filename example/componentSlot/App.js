import { h } from '../../lib/guide-mini-vue.esm.js';
import { Foo } from './Foo.js';

export const App = {
	name: "App",
	render() {
		const app = h("div", {}, "App")
		// <div> <Foo> <p>123</p> </Foo> </div>
		// 支持 vnode
		const foo = h(Foo, {},
			{ header: ({ age }) => h("p", {}, "header" + age), footer: () => h("p", {}, "footer") })// 通过 object.key 获取内容

		// 数组
		// const foo = h(Foo, {}, [h("p", {}, "123"), h("p", {}, "234")])

		return h("div", {}, [app, foo])
	},

	setup() {
		return {}
	}
};
