import { h } from '../../lib/guide-mini-vue.esm.js';

export const Foo = {
	setup(props, { emit }) {
		const emitAdd = () => {
			console.log("emit Add");
			emit("add", 1, 2)
			// 烤肉串类型的事件
			emit("add-One", 1, 2)
		};

		return {
			emitAdd,
		}

	},
	render() {
		const btn = h(
			"button",
			{
				onClick: this.emitAdd,
			},
			"emitAdd"
		);

		const foo = h("p", {}, "foo");
		return h("div", {}, [foo, btn])
	}
};
