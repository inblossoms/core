import { effect, stop } from '../effect';
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


	/**
	 * 1. 通过 effect 的第二个参数给定一个scheduler的函数
	 * 2. effect 第一次执行时执行run
	 * 3. 当响应式对象通过set进行update更新的时候，不会执行run 而是执行scheduler
	 * 4. 如果说执行 runner 的时候，我们执行的是 scheduler 的函数
	 */
	it("scheduler", () => {
		let dummy;
		let run: any
		const scheduler = jest.fn(() => {
			run = runner;
		})
		const obj = reactive({ foo: 1 })
		const runner = effect(
			() => {
				dummy = obj.foo
			},
			{
				scheduler
			}
		)

		expect(scheduler).not.toHaveBeenCalled()
		expect(dummy).toBe(1)

		obj.foo++
		expect(scheduler).toHaveBeenCalledTimes(1)

		expect(dummy).toBe(1)
		run()
		expect(dummy).toBe(2)

	})

	it("stop", () => {
		let dummy;
		const obj = reactive({ prop: 1 })
		const runner = effect(() => {
			dummy = obj.prop;
		})

		obj.prop = 2
		expect(dummy).toBe(2)
		stop(runner)
		// obj.prop = 3;   // 这种方式 是调用setter
		obj.prop++
		// 表达式在执行的时候 会分别指向getter 和 setter ，但是在未做 （stop优化时）会有问题：getter会在每一次执行的时候将第一次的effect清空 导致以自加加的方式获取前不到值
		expect(dummy).toBe(2)

		runner()
		expect(dummy).toBe(3)
	})

	/**
	 * 	onStop 是 用户通过stop后执行的回调，允许用户在这里执行一些事情
	 * */
	it("onStop", () => {
		const obj = reactive({ foo: 1 })
		const onStop = jest.fn()
		let dummy;
		const runner = effect(
			() => {
				dummy = obj.foo
			},
			{
				onStop
			}
		)

		stop(runner)
		expect(onStop).toBeCalledTimes(1);

	})
})


