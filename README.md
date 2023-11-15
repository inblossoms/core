### Vue3 core

> 实现 Vue3 的核心三大模块：reactivity、runtime、compiler。更好的理解 vue 的核心机制、工作方式，为解决业务中的难点提供更大的思考空间。

### Tasking

#### runtime-core

- [x] 支持组件类型
- [x] 支持 element 类型
- [x] 初始化 props
- [x] setup 可获取 props 和 context
- [x] 支持 component emit
- [x] 支持 proxy
- [x] 可以在 render 函数中获取 setup 返回的对象
- [x] nextTick 的实现
- [x] 支持 getCurrentInstance
- [x] 支持 provide/inject
- [x] 支持最基础的 slots
- [x] 支持 Text 类型节点
- [x] 支持 $el api
- [x] 支持 watchEffect


#### reactivity

用自定义的 reactivity 支持现有的 demo 运行

- [x] reactive 的实现
- [x] ref 的实现
- [x] readonly 的实现
- [x] computed 的实现
- [x] track 依赖收集
- [x] trigger 触发依赖
- [x] 支持 isReactive
- [x] 支持嵌套 reactive
- [] 支持 toRaw
- [] 支持 effect.scheduler
- [] 支持 effect.stop
- [] 支持 isReadonly
- [] 支持 isProxy
- [] 支持 shallowReadonly
- [] 支持 proxyRefs

### compiler-core
- [] 解析插值
- [] 解析 element
- [] 解析 text

### runtime-dom
- [] 支持 custom renderer 

### runtime-test
- [] 支持测试 runtime-core 的逻辑

### infrastructure
- [] support monorepo with pnpm
