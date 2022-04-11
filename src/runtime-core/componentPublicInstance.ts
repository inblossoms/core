const publicPropertiesMap = {
	$el: (i) => i.vnode.el
}


export const PublicInstanceProxyHandlers = {
	get({ _: instance }, key) {
		// 实现 setupState的获取
		const { setupState } = instance
		if (key in setupState) {// key 就是"hi" + this.msg 这里的msg
			return setupState[key];
		}
		//  当调用$el时 key 就是$el
		// if (key === "$el") {
		// 	return instance.vnode.el; // 这种方式需要保证拿到的实例出来的vnode 的el存在
		// }
		const publicGetter = publicPropertiesMap[key]
		if (publicGetter) {
			return publicGetter[instance];
		}
	}
};
