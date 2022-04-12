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
		return h("div", {}, [foo, renderSlots(this.$slots)])
	}
};
