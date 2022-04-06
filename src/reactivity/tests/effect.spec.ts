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
})