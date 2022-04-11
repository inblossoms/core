import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
	// 1. props 可以通过setup传入过来
	setup(props) {
		console.log(props); // 假设： props.count

		// 3. props 是不可以被修改的，必须是一个shallow readonly对象
		props.count++
		console.log(props);
	}

	, render() {
		return h("div", {}, "foo:" + this.count) // 2. props内部的值 可以在render这边通过this获取
	},
};
