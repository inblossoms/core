import { effect } from "../reactivity/effect";
import { EMPTY_OBJ } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

// 原先是通过具体的方式来实现，现在依赖于新建的渲染接口
export function createRenderer(options) {

	const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options

	function render(vnode, container) {

		patch(null, vnode, container, null);

	} // 目的： 代用一个patch方法 为了后续进行一个递归的处理

	// prevN -> 旧的虚拟节点  currentN -> 当前的虚拟节点
	function patch(prevN, currentN, container, parentComponent) {
		// ShapeFlags 描述节点类型，标识当前的vnode有哪几种flag
		// console.log(vnode.type);
		const { type, shapeFlag } = currentN;

		// 处理 如果是Fragment的节点，那么就只渲染children
		switch (type) {
			case Fragment:
				processFragment(prevN, currentN, container, parentComponent)
				break;
			case Text:
				processText(prevN, currentN, container)
				break;

			default:
				if (shapeFlag & ShapeFlags.ELEMENT) {
					// element
					processElement(prevN, currentN, container, parentComponent);
				} else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
					// STATEFUL_COMPONENT
					processComponent(prevN, currentN, container, parentComponent); // 组件的执行程序
				}
				break;
		}


	} // 处理组件

	function processComponent(prevN, currentN: any, container: any, parentComponent) {
		mountComponent(currentN, container, parentComponent);
	}

	function mountComponent(initialVNode: any, container, parentComponent) {
		const instance = createComponentInstance(initialVNode, parentComponent);

		setupComponent(instance);
		setupRenderEffect(instance, initialVNode, container);
	}// 通过虚拟节点创建一个实例对象

	function setupRenderEffect(instance: any, initialVNode, container) {
		effect(() => { // 需要进行一个判断：是更新还是初始化  (主要是通过effect 依赖实际和触发依赖进行数据的更新)
			if (!instance.isMounted) {
				console.log("init");

				const { proxy } = instance;
				const subTree = (instance.subTree = instance.render.call(proxy)); // 拿到虚拟节点树
				// vnode（vnode 就是 ele 然后对其进行挂载 mountEle） 下一步调用 patch
				// console.log(subTree);
				patch(null, subTree, container, instance) // 初始化 没有旧的虚拟节点

				// ele -> mount 保证所有的ele都处理完成
				initialVNode.el = subTree.el;
				instance.isMounted = true; // 修改状态
			} else {
				console.log("update")
				// 更新ele 获取到旧的subTree上的节点 和 新值进行对比
				const { proxy } = instance;
				const subTree = instance.render.call(proxy);
				const prevSubTree = instance.subTree;
				instance.subTree = subTree; // 进行替换 拿到最新的值

				// console.log("current", subTree);
				// console.log("prev", prevSubTree);

				patch(prevSubTree, subTree, container, instance)
			}

		})
	}

	function processElement(prevN, currentN: any, container: any, parentComponent) {
		//  ele  类型也会分为 mount初始化 和 update更新
		if (!prevN) {
			mountElement(currentN, container, parentComponent);
		} else {
			patchElement(prevN, currentN, container)
		}
	}

	function patchElement(prevN, currentN, container) {
		console.log("patchElement");
		console.log("prevN", prevN);
		console.log("currentN", currentN);

		const prevProps = prevN.props || EMPTY_OBJ
		const currentProps = currentN.props || EMPTY_OBJ

		const el = (currentN.el = prevN.el) // 新的节点是没有el

		patchProps(el, prevProps, currentProps)
	}

	function patchProps(el, prevProps, currentProps) {
		if (prevProps !== currentProps) {
			// 1. 遍历查看新旧值是否存在变化
			for (const key in currentProps) {
				const prevProp = prevProps[key]
				const currentProp = currentProps[key]

				if (prevProp !== currentProp) {
					hostPatchProp(el, key, prevProp, currentProp)
				}
			}

			if (currentProps !== EMPTY_OBJ) {
				// 某属性在新的节点内不存在了  -- 移除掉
				for (const key in prevProps) {
					if (!(key in currentProps)) {
						hostPatchProp(el, key, currentProps[key], null)
					}
				}
			}

		} // 如果并未发生改变 就不需要进行ele的更新
	}

	function mountElement(vnode: any, container: any, parentComponent) {
		// canvas ： 通过new Element() 创建元素
		const el = (vnode.el = hostCreateElement(vnode.type)) // 将el存起来   vnode是ele类型的 入口文件的div根元素

		// string array
		const { children, shapeFlag } = vnode
		// children
		if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
			// text_children
			el.textContent = children;
		} else if (shapeFlag & ShapeFlags.ARRRAY_CHILDREN) {
			// 如果是array 说明传进来的是vnode 需要调用patch来继续判断ele还是conpontent
			// array_children
			mountChildren(vnode, el, parentComponent);
		}
		// props
		const { props } = vnode
		for (const key in props) {
			const val = props[key]

			hostPatchProp(el, key, null, val);
		}

		// container.append(el); // 在这里将创建并设置好属性后的DOM添加在容器里
		// console.log(container);

		hostInsert(el, container)
	}

	function mountChildren(vnode: any, container: any, parentComponent) {
		vnode.children.forEach((v) => {
			patch(null, v, container, parentComponent)
		})

	}

	function processFragment(prevN, currentN: any, container: any, parentComponent) {
		mountChildren(currentN, container, parentComponent)
	}

	function processText(prevN, currentN: any, container: any) {
		const { children } = currentN;
		const textNode = (currentN.el = document.createTextNode(children))
		container.append(textNode)
	}

	return {
		createApp: createAppAPI(render)
	}

}