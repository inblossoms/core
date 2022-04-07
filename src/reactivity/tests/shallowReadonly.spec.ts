import { isReadonly, shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
	it("should not make non-reactive properties reactive", () => {
		const props = shallowReadonly({ n: { foo: 1 } })
		expect(isReadonly(props)).toBe(true)
		expect(isReadonly(props.n)).toBe(false)
	})

	it("warn then call set", () => {
		console.warn = jest.fn()

		const user = shallowReadonly({
			name: "zhangsan"
		})

		user.name = "lisi"
		expect(console.warn).toBeCalled()
	})
})