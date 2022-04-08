import { effect } from "../effect"
import { reactive } from "../reactive";
import { isRef, proxyRefs, ref, unRef } from '../ref';
describe("ref", () => {
	it("happy path", () => {
		const a = ref(1)
		expect(a.value).toBe(1)
	})

	it("should be reactive", () => {
		const a = ref(1)
		let dummy
		let calls = 0
		effect(() => {
			calls++
			dummy = a.value
		})

		expect(calls).toBe(1)
		expect(dummy).toBe(1)
		a.value = 2
		expect(calls).toBe(2)
		expect(dummy).toBe(2)

		// same value should not trigger
		a.value = 2
		expect(calls).toBe(2)
		expect(dummy).toBe(2)
	})

	it("should make nested properties eractive", () => {
		const a = ref({
			count: 1
		})

		let dummy
		effect(() => {
			dummy = a.value.count
		})

		expect(dummy).toBe(1)
		a.value.count = 2
		expect(dummy).toBe(2)
	})

	it("isRef", () => {
		const res = ref(1)
		const dummy = reactive({
			foo: 1
		})

		expect(isRef(res)).toBe(true)
		expect(isRef(1)).toBe(false)
		expect(isRef(dummy)).toBe(false)
	})



	it("unRef", () => {
		const res = ref(1)
		const dummy = reactive({
			foo: 1
		})

		expect(unRef(res)).toBe(1)
		expect(unRef(1)).toBe(1)
	})



	// 

	it("proxyRefs", () => { // proxyRefs 函数使得在模板中获取属性时不需要.value
		const user = {
			age: ref(99),
			name: "zhangsan"
		}

		const proxyUser = proxyRefs(user)
		//  getter：如果值是一个 ref 类型就通过 .value 将值返回，反之直接返回
		expect(user.age.value).toBe(99)
		expect(proxyUser.age).toBe(99)
		expect(proxyUser.name).toBe("zhangsan")

		proxyUser.age = 20

		// setter: 如果是一个ref类型修改.value，
		expect(proxyUser.age).toBe(20)
		expect(user.age.value).toBe(20)

		proxyUser.age = ref(10)
		// 在值不是一个ref的时候去替换它
		expect(proxyUser.age).toBe(10)
		expect(user.age.value).toBe(10)

	})
})