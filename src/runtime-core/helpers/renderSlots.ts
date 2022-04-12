import { createVNode, Fragment } from "../vnode";

export function renderSlots(slots, name, props) {

	const slot = slots[name] // 判断slots里面有没有内容
	if (typeof slot === "function") {
		return createVNode(Fragment, {}, slot(props))
	}

};
