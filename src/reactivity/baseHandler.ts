import { extend, isObject } from "../shared/index";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)


// 公共抽取：提取reactive和readonly的getter 和 setter
function createGetter(isReadonly = false, shallow = false) {
	return function get(target, key, value) {
		// console.log(key);
		const res = Reflect.get(target, key, value);

		if (key === ReactiveFlags.IS_REACTIVE) {
			return !isReadonly;
		} else if (key === ReactiveFlags.IS_READONLY) {
			return isReadonly;
		}

		if (shallow) return res;// 如果是shallowReadonly类型就不需要继续做响应式 直接返回

		// 判断 res 这个返回值是不是 object 对其内部的数据做响应式处理
		if (isObject(res)) return isReadonly ? readonly(res) : reactive(res)

		// {foo: 1}
		if (!isReadonly) {
			track(target, key) // 进行依赖收集
		}
		return res;
	}
}

function createSetter() {
	return function set(target, key, value) {
		const res = Reflect.set(target, key, value);
		// TODO 触发依赖
		trigger(target, key)
		return res;
	}
}

// 抽离 reactive 
export const mutableHandlers = {
	get,
	set
}

// 抽离 readonly
export const readonlyHandlers = {
	get: readonlyGet,
	set(target, key, value) {
		console.warn(`key ${key} is The read-only property cannot be modified！`, target);
		return true;
	}
}

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
	get: shallowReadonlyGet,
})