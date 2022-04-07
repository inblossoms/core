class ReactiveEffect { // 我们搜集的依赖 就是该类（确切的说是有该类包装后的数据）
	private _fn: any;  // 声明 fn

	constructor(fn) {
		this._fn = fn
	}

	run() { // 当run调用的时候就意味着函数执行了
		activeEffect = this; // 通过 this 就拿到了当前的依赖的实例对象了
		return this._fn(); // 将_fn 内部的返回值拿到
	}
}


let targetMap = new Map();
export function track(target, key) { // 我们的track是在reactive中的proxy函数内调用的
	/**
	 * track：我们需要将track传进来的数据起来 一个搜集的依赖的容器 这里通过 set 函数，来确定值的为一性
	 * 我们的依赖项和track传进来的数据存在一个关系：target -> key -> dep  dep即我们实例出来的依赖：
	 */

	let depsMap = targetMap.get(target);
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

	dep.add(activeEffect);// dep: target[key]    我们在这里通过add方法进行依赖收集
}



let activeEffect
export function effect(fn) {
	// fn 需要被一出来就调用 我们可以抽离出一个类来实现
	const _effect = new ReactiveEffect(fn)

	// 当我们调用_effect的时候 是希望可以立即执行 fn 的
	_effect.run()

	// 这里我们希望在执行effect的时候通过回调返回的函数可以将effect拿到的值的内容一起返回
	return _effect.run.bind(_effect);// 需要注意关联调用者的this指向
}


export function trigger(target, key) { // 通过target和key 对拿到通过track收集到依赖进行遍历
	let depsMap = targetMap.get(target)
		, dep = depsMap.get(key);

	for (const effect of dep) {
		effect.run()
	}
}