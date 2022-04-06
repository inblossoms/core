import { track, trigger } from "./effect";

export function reactive(raw) {// 模拟 vue 代理
	return new Proxy(raw, {
		get(target, key) {
			// {foo: 1}
			const res = Reflect.get(target, key);

			track(target, key) // 进行依赖收集
			return res;
		},

		set(target, key, value) {
			const res = Reflect.set(target, key, value);

			// TODO 触发依赖
			trigger(target, key)
			return res;
		}
	})
}