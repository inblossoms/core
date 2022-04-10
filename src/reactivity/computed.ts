import { ReactiveEffect } from "./effect";

class ComputedRefImp {
	private _getter: any;
	private _dirty: boolean = true; // 做标记：如果已经被调用过了就通过this._effect.run直接返回上一次的值
	private _value: any;
	private _effect: ReactiveEffect;
	constructor(getter) {
		this._getter = getter

		this._effect = new ReactiveEffect(getter, () => {
			if (!this._dirty) {
				this._dirty = true
			}
		})  // 因为当依赖的响应式对象的值发生改变的时候 会需要通过effect进行一个收集
	}

	get value() {

		// 当value改变时  希望可以将 dirty 改变成true
		// get
		if (this._dirty) { // 计算属应该在依赖属性未做修改时 只调用一次
			this._dirty = false;
			this._value = this._effect.run()
		}
		return this._value;
	}

}


export function computed(getter) {
	return new ComputedRefImp(getter)
}