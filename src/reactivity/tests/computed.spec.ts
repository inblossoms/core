import { reactive } from "../reactive"
import { computed } from '../computed';


describe("computed", () => {
	it("happy path", () => {
		const user = reactive({
			age: 1
		})

		const age = computed(() => {
			return user.age;
		})

		expect(age.value).toBe(1)
	})


	it("should compute lazily", () => {
		const value = reactive({
			foo: 1,
		})

		const getter = jest.fn(() => {
			return value.foo;
		})

		const cValue = computed(getter)

		// lazy
		expect(getter).not.toHaveBeenCalled()

		expect(cValue.value).toBe(1)
		expect(getter).toHaveBeenCalledTimes(1)

		// should nor cpmpute again
		cValue.value; // 调用getter
		expect(getter).toHaveBeenCalledTimes(1)   // 判断执行次数

		// should not compute until needed
		value.foo = 2   // 当响应式对象调用set 方法时， 就会调用trigger
		expect(getter).toHaveBeenCalledTimes(1)

		// now it should compute
		expect(cValue.value).toBe(2)
		expect(getter).toHaveBeenCalledTimes(2)

		// should not compute again
		cValue.value;
		expect(getter).toHaveBeenCalledTimes(2)

	})


})