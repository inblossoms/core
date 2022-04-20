
import { createRenderer } from '../../lib/guide-mini-vue.esm.js';
import { App } from './App.js';

console.log(PIXI);
// 设置画布
const game = new PIXI.Application({
	width: 400,
	height: 400
})

document.body.append(game.view)

// 通过我们自己的constomRender Api:   createEnderer实现了适用于cavans平台的实现
const renderer = createRenderer({
	createElement(type) {
		if (type === "rect") {
			const rect = new PIXI.Graphics()
			rect.beginFill(0xff0000)
			rect.drawRect(0, 0, 100, 100)
			rect.endFill()

			return rect;
		}
	},
	patchProp(el, key, val) {
		el[key] = val
	},
	insert(el, parent) {
		parent.addChild(el)
	}

})

renderer.createApp(App).mount(game.stage)


// const rootContainer = document.querySelector("#app")
// createApp(App).mount(rootContainer);