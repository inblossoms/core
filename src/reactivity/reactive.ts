import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandler";
import { track, trigger } from "./effect";

export const enum ReactiveFlags {
	IS_REACTIVE = "__V_isReactive",
	IS_READONLY = "__V_isReadonly",
}


export function reactive(raw) {// 模拟 vue 代理
	return createActiveObject(raw, mutableHandlers)
}

export function shallowReadonly(raw) {
	return createActiveObject(raw, shallowReadonlyHandlers)
}

export function readonly(raw) {
	return createActiveObject(raw, readonlyHandlers)
}

export function isReadonly(value) {
	return !!value[ReactiveFlags.IS_READONLY]
}

export function isReactive(value) {// 需要注意：vlaue 如果没有调用到 reactive 的方法是不会触发getter中的条件判断 所以向基于isReactive是无法达到判断效果的,所以就需要我们手动将他转化为布尔值 
	return !!value[ReactiveFlags.IS_REACTIVE]
}

function createActiveObject(raw: any, baseHandlers) {
	return new Proxy(raw, baseHandlers);
}
