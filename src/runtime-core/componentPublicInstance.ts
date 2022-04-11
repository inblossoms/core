import { hasOwn } from "../shared/index";

const publicPropertiesMap = {
	$el: (i) => i.vnode.el
}


export const PublicInstanceProxyHandlers = {
	get({ _: instance }, key) {
		// 实现 setupState的获取
		const { setupState, props } = instance
		if (key in setupState) {// key 就是"hi" + this.msg 这里的msg
			return setupState[key];
		}

		if (hasOwn(setupState, key)) {
			return setupState[key]
		} else if (hasOwn(props, key)) {
			return props[key]
		}

		const publicGetter = publicPropertiesMap[key]
		if (publicGetter) {
			return publicGetter[instance];
		}
	}
};
