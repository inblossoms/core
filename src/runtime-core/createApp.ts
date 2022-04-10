import { render } from "./renderer";
import { createVNode } from "./vnode"

export function createApp(rootComponent) {

	return {

		mount(rootContainer) {
			//  vue 内部是先生成VNode： component -> vnode  所有逻辑操作都是基于VNode实现
			const vnode = createVNode(rootComponent);

			render(vnode, rootContainer);
		}// 参数接收的是一个ele实例 即：最终的根容器
	}
} // 目的： 返回一个组件