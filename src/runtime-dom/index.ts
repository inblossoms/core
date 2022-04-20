import { createRenderer } from '../runtime-core';


function createElement(type) {
	console.log("createElement -----------------");

	return document.createElement(type)
}

function patchProp(el, key, val) {
	console.log("patchProp -----------------");
	// on + event name
	const isOn = (key: string) => /^on[A-Z]/.test(key)
	if (isOn(key)) {
		const event = key.slice(2).toLowerCase();
		el.addEventListener(event, val)
	} else {
		el.setAttribute(key, val)
	}

}

function insert(el, parent) {
	console.log("insert -----------------");
	parent.append(el)
}


const renderer: any = createRenderer({
	createElement,
	patchProp,
	insert
}) // 基于dom的渲染接口

export function createApp(...args) {
	return renderer.createApp(...args);
}

export * from '../runtime-core';// runtime-dom 的层次在core上 所以将core提进来