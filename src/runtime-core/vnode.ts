
export function createVNode(type, props?, children?) {

	const vonode = {
		type,
		props,
		children
	}

	return vonode;

}