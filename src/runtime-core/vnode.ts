
export function createVNode(type, props?, children?) {

	const vonode = {
		type,
		props,
		children,
		el: null, // 把根节点 el 存起来
	}

	return vonode;

}