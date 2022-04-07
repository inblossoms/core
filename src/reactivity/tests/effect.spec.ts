import { effect } from '../effect';
import { reactive } from '../reactive';
describe("effect", () => {
	it("happy path", () => {
		const user = reactive({
			age: 20,
		})

		let nextAge;
		effect(() => {
			nextAge = user.age + 1;
		})

		expect(nextAge).toBe(21)

		// update
		user.age++;
		expect(nextAge).toBe(22)
	})

	it("should return runner when call effect", () => {
		/*  实现：完善effect的部分功能
					当调用 effect(fn) 功能时,会返回一个函数（这里称为runner），
					当调用runner的时候会执行fn,runner可以拿到fn函数内部的返回值
		*/
		let foo = 10;
		const runner = effect(() => {
			foo++
			return "foo"
		})

		expect(foo).toBe(11)
		const r = runner();
		expect(foo).toBe(12)
		expect(r).toBe("foo")
	})
})