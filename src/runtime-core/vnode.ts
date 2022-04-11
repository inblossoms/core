import { ShapeFlags } from "../shared/ShapeFlags";

export function createVNode(type, props?, children?) {

	const vonode = {
		type,
		props,
		children,
		shapeFlag: getShapeFlag(type),
		el: null, // 把根节点 el 存起来
	}
	// debugger
	// children
	if (typeof children === "string") {
		vonode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
	} else if (Array.isArray(children)) {
		vonode.shapeFlag |= ShapeFlags.ARRRAY_CHILDREN
	}

	return vonode;

}

function getShapeFlag(type: any) {
	return typeof type === "string" ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}
