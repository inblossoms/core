const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null, // 把根节点 el 存起来
    };
    // debugger
    // children
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ARRRAY_CHILDREN */;
    }
    // 并不是所有的children都有插槽 在这里进行判断一下
    // 判断插槽： vnode是一个component组件类型 + children是object
    if (vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        if (typeof children === "object") {
            vnode.shapeFlag |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
}
const createTextVNode = (text) => {
    return createVNode(Text, {}, text);
};
function getShapeFlag(type) {
    return typeof type === "string" ? 1 /* ELEMENT */ : 2 /* STATEFUL_COMPONENT */;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name]; // 判断slots里面有没有内容
    if (typeof slot === "function") {
        return createVNode(Fragment, {}, slot(props));
    }
}

const extend = Object.assign; // 做从数据源对象内进行值的抽取
const EMPTY_OBJ = {};
const isObject = (val) => {
    return val !== null && typeof val === "object";
};
const hasChanged = (val, newVal) => {
    return !Object.is(val, newVal); // 判断值是否发生了改变 为改变范围false
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
// add-foo -> ddFoo
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
// add -> Add
const caplitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHandlerKey = (str) => {
    return str ? "on" + caplitalize(str) : "";
};

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.deps = []; // 存储依赖 
        this.active = true;
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.active) { // 判断是否是第一次执行 如果是多次执行就不走getter方法了 -> stop
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this; // 通过 this 就拿到了当前的依赖的实例对象了
        let reslut = this._fn();
        shouldTrack = false;
        return reslut; // 将_fn 内部的返回值拿到
    }
    stop() {
        // 保证外部用户多次点击 cleanupEffect 函数也是只执行一次
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) { // 做函数的二次提交
                this.onStop();
            }
            this.active = false;
        }
    }
}
// 删除dep记录 促使其的第二次执行在scheduler
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
}
let targetMap = new Map();
function track(target, key) {
    /**
     * track：我们需要将track传进来的数据起来 一个搜集的依赖的容器 这里通过 set 函数，来确定值的为一性
     * 我们的依赖项和track传进来的数据存在一个关系：target -> key -> dep  dep即我们实例出来的依赖：
     */
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target); // 对象
    // 初始化一下数据 判断数据是否存在
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep); // 将对象里的值 转换出来 {a: 1} => {a: dep(1)}
    }
    trackEffects(dep);
}
function isTracking() {
    return shouldTrack && activeEffect !== "undefined";
    // 排除activeEffect的寄生环境 run 未执行的时候处于 undefined状态
}
function trackEffects(dep) {
    if (dep.has(activeEffect))
        return; // 判断在dep之前 数据收已经存在 存在就直接返回
    dep.add(activeEffect); // dep: target[key]    我们在这里通过add方法进行依赖收集
    activeEffect.deps.push(dep); // 通过activeEffect反向收集：用于实现实现 effect 的 stop 功能，提供依赖
}
function effect(fn, options = {}) {
    const scheduler = options.scheduler; //当响应式对象发生第二次修改时，进行一个标记
    const _effect = new ReactiveEffect(fn, scheduler); // fn 需要被一出来就调用 我们可以抽离出一个类来实现
    extend(_effect, options); // 取值
    // 当我们调用_effect的时候 是希望可以立即执行 fn 的
    _effect.run();
    // 这里我们希望在执行effect的时候通过回调返回的函数可以将effect拿到的值的内容一起返回
    const runner = _effect.run.bind(_effect); // 需要注意关联调用者的this指向
    runner.effect = _effect;
    return runner;
}
function trigger(target, key) {
    let depsMap = targetMap.get(target), dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) { //当响应式对象有标记 就调用scheduler函数的执行
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
// 公共抽取：提取reactive和readonly的getter 和 setter
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, value) {
        // console.log(key);
        const res = Reflect.get(target, key, value);
        if (key === "__V_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__V_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        if (shallow)
            return res; // 如果是shallowReadonly类型就不需要继续做响应式 直接返回
        // 判断 res 这个返回值是不是 object 对其内部的数据做响应式处理
        if (isObject(res))
            return isReadonly ? readonly(res) : reactive(res);
        // {foo: 1}
        if (!isReadonly) {
            track(target, key); // 进行依赖收集
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
// 抽离 reactive 
const mutableHandlers = {
    get,
    set
};
// 抽离 readonly
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key ${key} is The read-only property cannot be modified！`, target);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});

function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function createActiveObject(target, baseHandlers) {
    if (!isObject(target)) {
        console.warn(`target: ${target}, 必须是一个对象`);
        return target;
    }
    return new Proxy(target, baseHandlers);
}

/**
 * 通过ref进行包裹传进来的值是不确定的：1 true "aaa"
 * proxy 针对的是一个对象 所以我们需要通过 get set 对value值进行一个包裹
*/
class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this.rawValue = value;
        // 判断 通过ref传进来的值是否是一个对象  ref内部通过.value调用reactive进行响应式转换
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        // 在对比的时候 this.value 可能已经是一个响应时的了 需要进行一个转换：
        if (hasChanged(this.rawValue, newValue)) { // 重复赋值即新旧值并未发生改变 直接返回
            this.rawValue = newValue;
            this._value = convert(newValue);
            // 在值修改后进行scheduler函数的执行
            triggerEffects(this.dep);
        }
    }
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef; // 当传递进来的是一个原始值 身上就不会有__v_isRef这个key 此时为undefined  需要进行布尔值转换
}
function unRef(ref) {
    // 判断ref 是否为一个ref对象，是返回ref.value  不是就将值返回
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWidthRefs) {
    return new Proxy(objectWidthRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

const emit = (instance, event, ...args) => {
    console.log("emit", event);
    // instance.props  -> event
    const { props } = instance;
    //  TPP
    //  先梳理出特定行为  -> 重构成通用行为
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
};

const initProps = (instance, rawProps) => {
    instance.props = rawProps || {};
    // TODO 处理 attrs
};

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // 实现 setupState的获取
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initSlots(instance, children) {
    // children object
    // instance.slots = Array.isArray(children) ? children : [children];
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        //  vlaue ==> slot
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

let currentInstance = null;
function createComponentInstance(vnode, parent) {
    console.log("createComponentInstance", parent);
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {},
        emit: () => { },
    };
    component.emit = emit.bind(null, component);
    return component;
} // 通过虚拟节点创建一个实例对象
function setupComponent(instance) {
    initProps(instance, instance.vnode.props); // 初始化 props
    initSlots(instance, instance.vnode.children); // 添加slots
    setupStatefulComponent(instance); // 初始化一个 有状态的组件
}
function setupStatefulComponent(instance) {
    const Component = instance.type; // 通过实例对象 拿到vnode 的type属性
    // ctx  实现setupState 和 this.$el值的获取
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance); // 通过全局变量拿到当前组件的实例对象
        // setup 会返回一个function（name将会是一个render函数）或者 object（返回成一个对象 注入到当前组件的上下文中
        const setupRequest = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null); // 执行后清空
        handleSetupResult(instance, setupRequest);
    } // 判断是否有写 setup
} // 对数据进行处理 通过setup拿到返回值
function handleSetupResult(instance, setupRequest) {
    if (typeof setupRequest === "object") { // 将值赋值给当前组件的实例对象上
        instance.setupState = proxyRefs(setupRequest);
    }
    finishComponentSetup(instance); // 保证组件的render有值
} // 对setup返回值 function和object 进行实现
function finishComponentSetup(instance) {
    const Component = instance.type;
    //if (!Component) {
    instance.render = Component.render;
    //	}// 判断render的存在 给当前实例对象上将render函数赋值过来
} //  保证组件的render有值
const getCurrentInstance = (params) => {
    return currentInstance;
};
const setCurrentInstance = (instance) => {
    currentInstance = instance;
}; // 通过断点 跟踪函数全局变量被谁赋值

const provide = (key, value) => {
    // 存值
    // 判断实例存不存在
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        // init 需要保证只执行一次
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
};
const inject = (key, defaultValue) => {
    // 取
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
            return defaultValue;
        }
    }
};

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                //  vue 内部是先生成VNode： component -> vnode  所有逻辑操作都是基于VNode实现
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            } // 参数接收的是一个ele实例 即：最终的根容器
        };
    }; // 目的： 返回一个组件
}

// 原先是通过具体的方式来实现，现在依赖于新建的渲染接口
function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options;
    function render(vnode, container) {
        patch(null, vnode, container, null);
    } // 目的： 代用一个patch方法 为了后续进行一个递归的处理
    // prevN -> 旧的虚拟节点  currentN -> 当前的虚拟节点
    function patch(prevN, currentN, container, parentComponent) {
        // ShapeFlags 描述节点类型，标识当前的vnode有哪几种flag
        // console.log(vnode.type);
        const { type, shapeFlag } = currentN;
        // 处理 如果是Fragment的节点，那么就只渲染children
        switch (type) {
            case Fragment:
                processFragment(prevN, currentN, container, parentComponent);
                break;
            case Text:
                processText(prevN, currentN, container);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    // element
                    processElement(prevN, currentN, container, parentComponent);
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    // STATEFUL_COMPONENT
                    processComponent(prevN, currentN, container, parentComponent); // 组件的执行程序
                }
                break;
        }
    } // 处理组件
    function processComponent(prevN, currentN, container, parentComponent) {
        mountComponent(currentN, container, parentComponent);
    }
    function mountComponent(initialVNode, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container);
    } // 通过虚拟节点创建一个实例对象
    function setupRenderEffect(instance, initialVNode, container) {
        effect(() => {
            if (!instance.isMounted) {
                console.log("init");
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy)); // 拿到虚拟节点树
                // vnode（vnode 就是 ele 然后对其进行挂载 mountEle） 下一步调用 patch
                // console.log(subTree);
                patch(null, subTree, container, instance); // 初始化 没有旧的虚拟节点
                // ele -> mount 保证所有的ele都处理完成
                initialVNode.el = subTree.el;
                instance.isMounted = true; // 修改状态
            }
            else {
                console.log("update");
                // 更新ele 获取到旧的subTree上的节点 和 新值进行对比
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree; // 进行替换 拿到最新的值
                // console.log("current", subTree);
                // console.log("prev", prevSubTree);
                patch(prevSubTree, subTree, container, instance);
            }
        });
    }
    function processElement(prevN, currentN, container, parentComponent) {
        //  ele  类型也会分为 mount初始化 和 update更新
        if (!prevN) {
            mountElement(currentN, container, parentComponent);
        }
        else {
            patchElement(prevN, currentN);
        }
    }
    function patchElement(prevN, currentN, container) {
        console.log("patchElement");
        console.log("prevN", prevN);
        console.log("currentN", currentN);
        const prevProps = prevN.props || EMPTY_OBJ;
        const currentProps = currentN.props || EMPTY_OBJ;
        const el = (currentN.el = prevN.el); // 新的节点是没有el
        patchProps(el, prevProps, currentProps);
    }
    function patchProps(el, prevProps, currentProps) {
        if (prevProps !== currentProps) {
            // 1. 遍历查看新旧值是否存在变化
            for (const key in currentProps) {
                const prevProp = prevProps[key];
                const currentProp = currentProps[key];
                if (prevProp !== currentProp) {
                    hostPatchProp(el, key, prevProp, currentProp);
                }
            }
            if (currentProps !== EMPTY_OBJ) {
                // 某属性在新的节点内不存在了  -- 移除掉
                for (const key in prevProps) {
                    if (!(key in currentProps)) {
                        hostPatchProp(el, key, currentProps[key], null);
                    }
                }
            }
        } // 如果并未发生改变 就不需要进行ele的更新
    }
    function mountElement(vnode, container, parentComponent) {
        // canvas ： 通过new Element() 创建元素
        const el = (vnode.el = hostCreateElement(vnode.type)); // 将el存起来   vnode是ele类型的 入口文件的div根元素
        // string array
        const { children, shapeFlag } = vnode;
        // children
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            // text_children
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ARRRAY_CHILDREN */) {
            // 如果是array 说明传进来的是vnode 需要调用patch来继续判断ele还是conpontent
            // array_children
            mountChildren(vnode, el, parentComponent);
        }
        // props
        const { props } = vnode;
        for (const key in props) {
            const val = props[key];
            hostPatchProp(el, key, null, val);
        }
        // container.append(el); // 在这里将创建并设置好属性后的DOM添加在容器里
        // console.log(container);
        hostInsert(el, container);
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach((v) => {
            patch(null, v, container, parentComponent);
        });
    }
    function processFragment(prevN, currentN, container, parentComponent) {
        mountChildren(currentN, container, parentComponent);
    }
    function processText(prevN, currentN, container) {
        const { children } = currentN;
        const textNode = (currentN.el = document.createTextNode(children));
        container.append(textNode);
    }
    return {
        createApp: createAppAPI(render)
    };
}

function createElement(type) {
    // console.log("createElement -----------------");
    return document.createElement(type);
}
function patchProp(el, key, prevVal, currentVal) {
    // console.log("patchProp -----------------");
    // on + event name
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, currentVal);
    }
    else {
        if (currentVal === undefined || currentVal === null) {
            el.removeAttribute(key);
            // 处理 值为undefined和null的情况， 移除该属性
        }
        else {
            el.setAttribute(key, currentVal);
        }
    }
}
function insert(el, parent) {
    // console.log("insert -----------------");
    parent.append(el);
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert
}); // 基于dom的渲染接口
function createApp(...args) {
    return renderer.createApp(...args);
}

export { createApp, createRenderer, createTextVNode, getCurrentInstance, h, inject, provide, proxyRefs, ref, renderSlots };
