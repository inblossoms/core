import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

export function createComponentInstance(vnode) {

	const component = {
		vnode,
		type: vnode.type,
		props: {},
		setupState: {},
		emit: () => { },
	}
	component.emit = emit.bind(null, component) as any;

	return component;
}// 通过虚拟节点创建一个实例对象


export function setupComponent(instance) {

	// TODO
	initProps(instance, instance.vnode.props)// 初始化 props
	// initSlots()


	setupStatefulComponent(instance); // 初始化一个 有状态的组件
}; // 函数内会初始化 props 和 slots插槽 



function setupStatefulComponent(instance: any) {

	const Component = instance.type; // 通过实例对象 拿到vnode 的type属性
	// ctx  实现setupState 和 this.$el值的获取
	instance.proxy = new Proxy({ _: instance },
		PublicInstanceProxyHandlers
	)
	const { setup } = Component

	if (setup) {
		// setup 会返回一个function（name将会是一个render函数）或者 object（返回成一个对象 注入到当前组件的上下文中
		const setupRequest = setup(shallowReadonly(instance.props), {
			emit: instance.emit
		});

		handleSetupResult(instance, setupRequest);

	} // 判断是否有写 setup


} // 对数据进行处理 通过setup拿到返回值


function handleSetupResult(instance, setupRequest: any) {
	// TODO funciton

	if (typeof setupRequest === "object") { // 将值赋值给当前组件的实例对象上
		instance.setupState = setupRequest
	}

	finishComponentSetup(instance);// 保证组件的render有值

} // 对setup返回值 function和object 进行实现


function finishComponentSetup(instance: any) {
	const Component = instance.type;
	//if (!Component) {
	instance.render = Component.render;
	//	}// 判断render的存在 给当前实例对象上将render函数赋值过来

} //  保证组件的render有值
