import { h, renderSlots } from '../../lib/guide-mini-vue.esm.js';

export const Foo = {
	setup() {
		return {}
	},
	render() {
		const foo = h(
			"p", {}, "foo"
		);

		console.log(this.$slots);
		// this.$slots 拿到的是一个数组 需要转成vnode
		// return h("div", {}, [foo, h("div", {}, this.$slots)]) // 粗暴写法

		// 让元素渲染到指定的位置
		// 具名插槽    1. 获取到渲染的元素 2. 获取到渲染的位置
		// 作用域插槽
		const age = 99
		return h("div", {}, [renderSlots(this.$slots, "header", { age }), foo, renderSlots(this.$slots, "footer")])
	}
};
