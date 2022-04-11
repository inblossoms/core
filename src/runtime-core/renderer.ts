import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {

	patch(vnode, container);

} // 目的： 代用一个patch方法 为了后续进行一个递归的处理


function patch(vnode, container) {
	// console.log(vnode.type);
	if (typeof vnode.type === "string") {
		processElement(vnode, container);
	} else if (isObject(vnode.type)) {
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
	const { children } = vnode
	if (typeof children === "string") {
		el.textContent = children;
	} else if (Array.isArray(children)) {
		// 如果是array 说明传进来的是vnode 需要调用patch来继续判断ele还是conpontent
		mountChildren(vnode, el);
	}
	// props
	const { props } = vnode
	for (const key in props) {
		const val = props[key]
		el.setAttribute(key, val)
	}

	container.append(el);
	// console.log(container);

}

function mountChildren(vnode: any, container: any) {
	vnode.children.forEach((v) => {
		patch(v, container)
	})

}

