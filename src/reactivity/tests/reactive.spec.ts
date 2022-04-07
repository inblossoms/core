import { readonly } from "../reactive";

describe("readonly", () => {
	it("happy path", () => {

		const original = { foo: 1, bar: { baz: 2 } };
		const wrapped = readonly(original)

		expect(wrapped).not.toBe(original)
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