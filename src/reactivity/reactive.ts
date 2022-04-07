import { mutableHandlers, readonlyHandlers } from "./baseHandler";
import { track, trigger } from "./effect";



export function reactive(raw) {// 模拟 vue 代理
	return createActiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
	return createActiveObject(raw, readonlyHandlers)
}

function createActiveObject(raw: any, baseHandlers) {
	return new Proxy(raw, baseHandlers);
}
