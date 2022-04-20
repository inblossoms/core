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
const isObject = (val) => {
    return val !== null && typeof val === "object";
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

let targetMap = new Map();
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
        instance.setupState = setupRequest;
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
    const { createElement, patchProp, insert } = options;
    function render(vnode, container) {
        patch(vnode, container, null);
    } // 目的： 代用一个patch方法 为了后续进行一个递归的处理
    function patch(vnode, container, parentComponent) {
        // ShapeFlags 描述节点类型，标识当前的vnode有哪几种flag
        // console.log(vnode.type);
        const { type, shapeFlag } = vnode;
        // 处理 如果是Fragment的节点，那么就只渲染children
        switch (type) {
            case Fragment:
                processFragment(vnode, container, parentComponent);
                break;
            case Text:
                processText(vnode, container);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    // element
                    processElement(vnode, container, parentComponent);
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    // STATEFUL_COMPONENT
                    processComponent(vnode, container, parentComponent); // 组件的执行程序
                }
                break;
        }
    } // 处理组件
    function processComponent(vnode, container, parentComponent) {
        mountComponent(vnode, container, parentComponent);
    }
    function mountComponent(initialVNode, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container);
    } // 通过虚拟节点创建一个实例对象
    function setupRenderEffect(instance, initialVNode, container) {
        const { proxy } = instance;
        const subTree = instance.render.call(proxy); // 拿到虚拟节点树
        // vnode（vnode 就是 ele 然后对其进行挂载 mountEle） 下一步调用 patch
        patch(subTree, container, instance);
        // ele -> mount 保证所有的ele都处理完成
        initialVNode.el = subTree.el;
    }
    function processElement(vnode, container, parentComponent) {
        //  ele  类型也会分为 mount初始化 和 update更新
        mountElement(vnode, container, parentComponent);
    }
    function mountElement(vnode, container, parentComponent) {
        // canvas ： 通过new Element() 创建元素
        const el = (vnode.el = createElement(vnode.type)); // 将el存起来   vnode是ele类型的 入口文件的div根元素
        // string array
        const { children, shapeFlag } = vnode;
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
            patchProp(el, key, val);
        }
        // container.append(el); // 在这里将创建并设置好属性后的DOM添加在容器里
        // console.log(container);
        insert(el, container);
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach((v) => {
            patch(v, container, parentComponent);
        });
    }
    function processFragment(vnode, container, parentComponent) {
        mountChildren(vnode, container, parentComponent);
    }
    function processText(vnode, container) {
        const { children } = vnode;
        const textNode = (vnode.el = document.createTextNode(children));
        container.append(textNode);
    }
    return {
        createApp: createAppAPI(render)
    };
}

function createElement(type) {
    console.log("createElement -----------------");
    return document.createElement(type);
}
function patchProp(el, key, val) {
    console.log("patchProp -----------------");
    // on + event name
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, val);
    }
    else {
        el.setAttribute(key, val);
    }
}
function insert(el, parent) {
    console.log("insert -----------------");
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

export { createApp, createRenderer, createTextVNode, getCurrentInstance, h, inject, provide, renderSlots };
