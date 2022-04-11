const extend = Object.assign; // 做从数据源对象内进行值的抽取
const isObject = (val) => {
    return val !== null && typeof val === "object";
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);

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
        // TODO 触发依赖
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

const initProps = (instance, rawProps) => {
    instance.props = rawProps || {};
    // TODO 处理 attrs
};

const publicPropertiesMap = {
    $el: (i) => i.vnode.el
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // 实现 setupState的获取
        const { setupState, props } = instance;
        if (key in setupState) { // key 就是"hi" + this.msg 这里的msg
            return setupState[key];
        }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter[instance];
        }
    }
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        props: {},
        setupState: {},
    };
    return component;
} // 通过虚拟节点创建一个实例对象
function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props); // 初始化 props
    // initSlots()
    setupStatefulComponent(instance); // 初始化一个 有状态的组件
}
function setupStatefulComponent(instance) {
    const Component = instance.type; // 通过实例对象 拿到vnode 的type属性
    // ctx  实现setupState 和 this.$el值的获取
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        // setup 会返回一个function（name将会是一个render函数）或者 object（返回成一个对象 注入到当前组件的上下文中
        const setupRequest = setup(shallowReadonly(instance.props));
        handleSetupResult(instance, setupRequest);
    } // 判断是否有写 setup
} // 对数据进行处理 通过setup拿到返回值
function handleSetupResult(instance, setupRequest) {
    // TODO funciton
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

function render(vnode, container) {
    patch(vnode, container);
} // 目的： 代用一个patch方法 为了后续进行一个递归的处理
function patch(vnode, container) {
    // ShapeFlags 描述节点类型，标识当前的vnode有哪几种flag
    // console.log(vnode.type);
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* ELEMENT */) {
        // element
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        // STATEFUL_COMPONENT
        processComponent(vnode, container); // 组件的执行程序
    }
} // 处理组件
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
} // 通过虚拟节点创建一个实例对象
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy); // 拿到虚拟节点树
    // vnode（vnode 就是 ele 然后对其进行挂载 mountEle） 下一步调用 patch
    patch(subTree, container);
    // ele -> mount 保证所有的ele都处理完成
    initialVNode.el = subTree.el;
}
function processElement(vnode, container) {
    //  ele  类型也会分为 mount初始化 和 update更新
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = (vnode.el = document.createElement(vnode.type)); // 将el存起来   vnode是ele类型的 入口文件的div根元素
    // string array
    const { children, shapeFlag } = vnode;
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
        // text_children
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ARRRAY_CHILDREN */) {
        // 如果是array 说明传进来的是vnode 需要调用patch来继续判断ele还是conpontent
        // array_children
        mountChildren(vnode, el);
    }
    // props
    const { props } = vnode;
    for (const key in props) {
        const val = props[key];
        // TODO 具体的事件 click -> 通用
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
    container.append(el);
    // console.log(container);
}
function mountChildren(vnode, container) {
    vnode.children.forEach((v) => {
        patch(v, container);
    });
}

function createVNode(type, props, children) {
    const vonode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null, // 把根节点 el 存起来
    };
    // debugger
    // children
    if (typeof children === "string") {
        vonode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vonode.shapeFlag |= 8 /* ARRRAY_CHILDREN */;
    }
    return vonode;
}
function getShapeFlag(type) {
    return typeof type === "string" ? 1 /* ELEMENT */ : 2 /* STATEFUL_COMPONENT */;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            //  vue 内部是先生成VNode： component -> vnode  所有逻辑操作都是基于VNode实现
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        } // 参数接收的是一个ele实例 即：最终的根容器
    };
} // 目的： 返回一个组件

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
