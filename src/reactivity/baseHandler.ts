import { track, trigger } from "./effect";

const get = createGetter()
const set = createSetter()
const readonlyget = createGetter(true)

// 公共抽取：提取reactive和readonly的getter 和 setter
function createGetter(isReadonly = false) {
	return function (target, key) {
		// {foo: 1}
		const res = Reflect.get(target, key);
		if (!isReadonly) {
			track(target, key) // 进行依赖收集
		}
		return res;
	}
}

function createSetter() {
	return function (target, key, value) {
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
	readonlyget,
	set(target, key, value) {
		console.warn(`key ${key} is The read-only property cannot be modified！`, target);

		return true;
	}
}