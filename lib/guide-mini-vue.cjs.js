'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const isObject = (val) => {
    return val !== null && typeof val === "object";
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
    };
    return component;
} // 通过虚拟节点创建一个实例对象
function setupComponent(instance) {
    // TODO
    // initProps()
    // initSlots()
    setupStatefulComponent(instance); // 初始化一个 有状态的组件
}
function setupStatefulComponent(instance) {
    const Component = instance.type; // 通过实例对象 拿到vnode 的type属性
    const { setup } = Component;
    if (setup) {
        // setup 会返回一个function（name将会是一个render函数）或者 object（返回成一个对象 注入到当前组件的上下文中
        const setupRequest = setup();
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
    // TODO 判断vnode是不是ele 
    // 是 ele 那么就应该处理ele 那如何区分 ele 和 compenent
    // console.log(vnode.type);
    if (typeof vnode.type === "string") {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode, container); // 组件的执行程序
    }
} // 处理组件
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
} // 通过虚拟节点创建一个实例对象
function setupRenderEffect(instance, container) {
    const subTree = instance.render(); // 拿到虚拟节点树
    // vnode（vnode 就是 ele 然后对其进行挂载 mountEle） 下一步调用 patch
    patch(subTree, container);
}
function processElement(vnode, container) {
    //  ele  类型也会分为 mount初始化 和 update更新
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    // string array
    const { children } = vnode;
    if (typeof children === "string") {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        // 如果是array 说明传进来的是vnode 需要调用patch来继续判断ele还是conpontent
        mountChildren(vnode, el);
    }
    // props
    const { props } = vnode;
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    // FIXME append 时 存在错误
    container.append(el);
    console.log(container);
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
        children
    };
    return vonode;
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

exports.createApp = createApp;
exports.h = h;
