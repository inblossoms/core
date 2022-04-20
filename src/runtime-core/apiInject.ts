import { getCurrentInstance } from "./component";

export const provide = (key, value) => {
	// 存值
	// 判断实例存不存在
	const currentInstance: any = getCurrentInstance(null)
	if (currentInstance) {
		let { provides } = currentInstance
		const parentProvides = currentInstance.parent.provides;
		// init 需要保证只执行一次
		if (provides === parentProvides) {
			provides = currentInstance.provides = Object.create(parentProvides)
		}

		provides[key] = value;
	}
};



export const inject = (key, defaultValue) => {
	// 取
	const currentInstance: any = getCurrentInstance(null)

	if (currentInstance) {
		const parentProvides = currentInstance.parent.provides

		if (key in parentProvides) {
			return parentProvides[key];
		} else if (defaultValue) {
			if (typeof defaultValue === "function") {
				return defaultValue()
			}
			return defaultValue
		}
	}
};

