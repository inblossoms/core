export const extend = Object.assign // 做从数据源对象内进行值的抽取

export const isObject = (val) => {
	return val !== null && typeof val === "object"
}

export const hasChanged = (val, newVal) => {
	return !Object.is(val, newVal)  // 判断值是否发生了改变 为改变范围false
}