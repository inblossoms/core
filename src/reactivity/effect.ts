import { extend } from "../shared";

let activeEffect
let shouldTrack

class ReactiveEffect { // 我们搜集的依赖 就是该类（确切的说是有该类包装后的数据）
	private _fn: any;  // 声明 fn
	deps = []; // 存储依赖 
	active = true;
	onStop?: () => void;
	public scheduler: Function | undefined
	constructor(fn, scheduler?: Function) {//scheduler: 是希望在类的外部被访问到的，可选择参数
		this._fn = fn
		this.scheduler = scheduler;
	}

	run() { // 当run调用的时候就意味着函数执行了
		if (!this.active) { // 判断是否是第一次执行 如果是多次执行就不走getter方法了 -> stop
			return this._fn()
		}
		shouldTrack = true
		activeEffect = this; // 通过 this 就拿到了当前的依赖的实例对象了

		let reslut = this._fn();
		shouldTrack = false
		return reslut// 将_fn 内部的返回值拿到
	}

	stop() {
		// 保证外部用户多次点击 cleanupEffect 函数也是只执行一次
		if (this.active) {
			cleanupEffect(this);
			if (this.onStop) {// 做函数的二次提交
				this.onStop();
			}
			this.active = false;
		}
	}
}
// 删除dep记录 促使其的第二次执行在scheduler
function cleanupEffect(effect) {
	effect.deps.forEach((dep: any) => {
		dep.delete(effect)
	})
}


let targetMap = new Map();
export function track(target, key) { // 我们的track是在reactive中的proxy函数内调用的
	/**
	 * track：我们需要将track传进来的数据起来 一个搜集的依赖的容器 这里通过 set 函数，来确定值的为一性
	 * 我们的依赖项和track传进来的数据存在一个关系：target -> key -> dep  dep即我们实例出来的依赖：
	 */

	if (!isTracking()) return;

	let depsMap = targetMap.get(target);// 对象
	// 初始化一下数据 判断数据是否存在
	if (!depsMap) {
		depsMap = new Map()
		targetMap.set(target, depsMap)
	}

	let dep = depsMap.get(key)
	if (!dep) {
		dep = new Set()
		depsMap.set(key, dep) // 将对象里的值 转换出来 {a: 1} => {a: dep(1)}
	};
	trackEffects(dep)
}

export function isTracking() {
	return shouldTrack && activeEffect !== "undefined"
	// 排除activeEffect的寄生环境 run 未执行的时候处于 undefined状态
}


export function trackEffects(dep) {
	if (dep.has(activeEffect)) return  // 判断在dep之前 数据收已经存在 存在就直接返回
	dep.add(activeEffect);// dep: target[key]    我们在这里通过add方法进行依赖收集
	activeEffect.deps.push(dep) // 通过activeEffect反向收集：用于实现实现 effect 的 stop 功能，提供依赖
}


export function effect(fn, options: any = {}) {

	const scheduler = options.scheduler;//当响应式对象发生第二次修改时，进行一个标记
	const _effect = new ReactiveEffect(fn, scheduler)// fn 需要被一出来就调用 我们可以抽离出一个类来实现

	extend(_effect, options);// 取值

	// 当我们调用_effect的时候 是希望可以立即执行 fn 的
	_effect.run()

	// 这里我们希望在执行effect的时候通过回调返回的函数可以将effect拿到的值的内容一起返回
	const runner: any = _effect.run.bind(_effect);// 需要注意关联调用者的this指向

	runner.effect = _effect;

	return runner;
}


export function trigger(target, key) { // 通过target和key 对拿到通过track收集到依赖进行遍历
	let depsMap = targetMap.get(target)
		, dep = depsMap.get(key);
	triggerEffects(dep)

}

export function triggerEffects(dep) {
	for (const effect of dep) {
		if (effect.scheduler) {//当响应式对象有标记 就调用scheduler函数的执行
			effect.scheduler();
		} else {
			effect.run()
		}
	}
}


export function stop(runner) {
	runner.effect.stop();
}