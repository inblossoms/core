export const extend = Object.assign // 做从数据源对象内进行值的抽取

export const EMPTY_OBJ = {}

export const isObject = (val) => {
	return val !== null && typeof val === "object"
}

export const hasChanged = (val, newVal) => {
	return !Object.is(val, newVal)  // 判断值是否发生了改变 为改变范围false
}

export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key)


// add-foo -> ddFoo
export const camelize = (str: string) => {
	return str.replace(/-(\w)/g, (_, c: string) => {
		return c ? c.toUpperCase() : ""
	})
}

// add -> Add
const caplitalize = (str: string) => {
	return str.charAt(0).toUpperCase() + str.slice(1)
};
export const toHandlerKey = (str: string) => {
	return str ? "on" + caplitalize(str) : ""
}

