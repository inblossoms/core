import { ShapeFlags } from "../shared/ShapeFlags";

export const Fragment = Symbol("Fragment")
export const Text = Symbol("Text")

export function createVNode(type, props?, children?) {

	const vnode = {
		type,
		props,
		children,
		shapeFlag: getShapeFlag(type),
		el: null, // 把根节点 el 存起来
	}
	// debugger
	// children
	if (typeof children === "string") {
		vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
	} else if (Array.isArray(children)) {
		vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
	}

	// 并不是所有的children都有插槽 在这里进行判断一下
	// 判断插槽： vnode是一个component组件类型 + children是object
	if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
		if (typeof children === "object") {
			vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
		}
	}

	return vnode;

}

export const createTextVNode = (text: string) => {
	return createVNode(Text, {}, text)
};


function getShapeFlag(type: any) {
	return typeof type === "string" ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}
