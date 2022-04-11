import { isObject } from "../shared/index";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {

	patch(vnode, container);

} // 目的： 代用一个patch方法 为了后续进行一个递归的处理


function patch(vnode, container) {
	// ShapeFlags 描述节点类型，标识当前的vnode有哪几种flag
	// console.log(vnode.type);
	const { shapeFlag } = vnode
	if (shapeFlag & ShapeFlags.ELEMENT) {
		// element
		processElement(vnode, container);
	} else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
		// STATEFUL_COMPONENT
		processComponent(vnode, container); // 组件的执行程序
	}

} // 处理组件

function processComponent(vnode: any, container: any) {
	mountComponent(vnode, container);
}



function mountComponent(initialVNode: any, container) {
	const instance = createComponentInstance(initialVNode);

	setupComponent(instance);
	setupRenderEffect(instance, initialVNode, container);
}// 通过虚拟节点创建一个实例对象


function setupRenderEffect(instance: any, initialVNode, container) {
	const { proxy } = instance;
	const subTree = instance.render.call(proxy); // 拿到虚拟节点树
	// vnode（vnode 就是 ele 然后对其进行挂载 mountEle） 下一步调用 patch

	patch(subTree, container)

	// ele -> mount 保证所有的ele都处理完成
	initialVNode.el = subTree.el;
}

function processElement(vnode: any, container: any) {
	//  ele  类型也会分为 mount初始化 和 update更新
	mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
	const el = (vnode.el = document.createElement(vnode.type)) // 将el存起来   vnode是ele类型的 入口文件的div根元素

	// string array
	const { children, shapeFlag } = vnode
	if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
		// text_children
		el.textContent = children;
	} else if (shapeFlag & ShapeFlags.ARRRAY_CHILDREN) {
		// 如果是array 说明传进来的是vnode 需要调用patch来继续判断ele还是conpontent
		// array_children
		mountChildren(vnode, el);
	}
	// props
	const { props } = vnode
	for (const key in props) {
		const val = props[key]
		// TODO 具体的事件 click -> 通用
		// on + event name
		const isOn = (key: string) => /^on[A-Z]/.test(key)
		if (isOn(key)) {
			const event = key.slice(2).toLowerCase();
			el.addEventListener(event, val)
		} else {
			el.setAttribute(key, val)
		}
	}

	container.append(el);
	// console.log(container);

}

function mountChildren(vnode: any, container: any) {
	vnode.children.forEach((v) => {
		patch(v, container)
	})

}

