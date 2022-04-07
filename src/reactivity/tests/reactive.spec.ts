import { reactive, readonly, isReactive, isReadonly } from "../reactive";

describe("readonly reactive", () => {

	it("realize reactive and readonly Nested object conversion", () => {
		const original = { foo: 1 }
		const observed = reactive(original)

		expect(observed).not.toBe(original)
		expect(observed.foo).toBe(1)
		expect(isReactive(observed)).toBe(true)
		expect(isReactive(original)).toBe(false)
	})

	test("nested reactive", () => {
		const original = {
			nested: {
				foo: 1
			},
			array: [{ bar: 2 }]
		}
		const observed = reactive(original)
		expect(isReactive(observed.nested)).toBe(true)
		expect(isReactive(observed.array)).toBe(true)
		expect(isReactive(observed.array[0])).toBe(true)
	})




	it("test isReactive", () => {
		const original = { foo: 1 }
		const observed = reactive(original)
		expect(observed).not.toBe(original)
		expect(observed.foo).toBe(1)
		expect(isReactive(observed)).toBe(true)
		expect(isReactive(original)).toBe(false)
	})



	it("test readonly", () => {

		const original = { foo: 1, bar: { baz: 2 } };
		const wrapped = readonly(original)
		expect(wrapped).not.toBe(original)
		expect(isReadonly(wrapped)).toBe(true)
		expect(isReadonly(original)).toBe(false)
		expect(isReadonly(wrapped.bar)).toBe(true)
		expect(isReadonly(original.bar)).toBe(false)
		expect(wrapped.foo).toBe(1)
	})


	it("warn then call set", () => {
		console.warn = jest.fn()

		const user = readonly({
			name: "zhangsan"
		})

		user.name = "lisi"
		expect(console.warn).toBeCalled()
	})
})