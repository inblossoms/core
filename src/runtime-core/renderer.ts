import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {

	patch(vnode, container);

} // 目的： 代用一个patch方法 为了后续进行一个递归的处理


function patch(vnode, container) {

	// TODO 判断vnode是不是ele 
	// 是 ele 那么就应该处理ele 那如何区分 ele 和 compenent

	// processElement();

	processComponent(vnode, container); // 组件的执行程序

} // 处理组件

function processComponent(vnode: any, container: any) {
	mountComponent(vnode, container);
}



function mountComponent(vnode: any, container) {
	const instance = createComponentInstance(vnode);

	setupComponent(instance);
	setupRenderEffect(instance, container);
}// 通过虚拟节点创建一个实例对象


function setupRenderEffect(instance: any, container) {
	const subTree = instance.render(); // 拿到虚拟节点树

	// vnode（vnode 就是 ele 然后对其进行挂载 mountEle） 下一步调用 patch

	patch(subTree, container)
}

