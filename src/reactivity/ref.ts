import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive"

/**
 * 通过ref进行包裹传进来的值是不确定的：1 true "aaa"
 * proxy 针对的是一个对象 所以我们需要通过 get set 对value值进行一个包裹
*/



class RefImpl {
	private _value: any
	public dep;
	private rawValue: any;
	public __v_isRef = true;

	constructor(value) {
		this.rawValue = value
		// 判断 通过ref传进来的值是否是一个对象  ref内部通过.value调用reactive进行响应式转换
		this._value = convert(value)
		this.dep = new Set()
	}

	get value() {
		trackRefValue(this)
		return this._value
	}
	set value(newValue) {
		// 在对比的时候 this.value 可能已经是一个响应时的了 需要进行一个转换：
		if (hasChanged(this.rawValue, newValue)) {// 重复赋值即新旧值并未发生改变 直接返回
			this.rawValue = newValue

			this._value = convert(newValue)
			// 在值修改后进行scheduler函数的执行
			triggerEffects(this.dep)
		};
	}
}

function trackRefValue(ref) {
	if (isTracking()) {
		trackEffects(ref.dep)
	}
}

function convert(value) {
	return isObject(value) ? reactive(value) : value;
}


export function ref(value) {
	return new RefImpl(value);
}


export function isRef(ref) {
	return !!ref.__v_isRef; // 当传递进来的是一个原始值 身上就不会有__v_isRef这个key 此时为undefined  需要进行布尔值转换
}

export function unRef(ref) {
	// 判断ref 是否为一个ref对象，是返回ref.value  不是就将值返回
	return isRef(ref) ? ref.value : ref;
}


