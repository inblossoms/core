import { isObject } from "../shared/index";
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

export function isProxy(value) {
	return isReactive(value) || isReadonly(value)
}

function createActiveObject(target, baseHandlers) {
	if (!isObject(target)) {
		console.warn(`target: ${target}, 必须是一个对象`);
		return target
	}
	return new Proxy(target, baseHandlers);
}
