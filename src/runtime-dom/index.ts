import { createRenderer } from '../runtime-core';


function createElement(type) {
	// console.log("createElement -----------------");

	return document.createElement(type)
}

function patchProp(el, key, prevVal, currentVal) {
	// console.log("patchProp -----------------");
	// on + event name
	const isOn = (key: string) => /^on[A-Z]/.test(key)
	if (isOn(key)) {
		const event = key.slice(2).toLowerCase();
		el.addEventListener(event, currentVal)
	} else {
		if (currentVal === undefined || currentVal === null) {
			el.removeAttribute(key)
			// 处理 值为undefined和null的情况， 移除该属性
		} else {
			el.setAttribute(key, currentVal)
		}
	}

}

function insert(el, parent) {
	// console.log("insert -----------------");
	parent.append(el)
}

function remove(child) {
	const parent = child.parentNode
	if (parent) {
		parent.removeChild(child)
	}
}

function setElementText(el, text) {
	el.textContent = text
}


const renderer: any = createRenderer({
	createElement,
	patchProp,
	insert,
	remove,
	setElementText
}) // 基于dom的渲染接口

export function createApp(...args) {
	return renderer.createApp(...args);
}

export * from '../runtime-core';// runtime-dom 的层次在core上 所以将core提进来