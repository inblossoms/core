const isObject = (val) => {
    return val !== null && typeof val === "object";
};

const publicPropertiesMap = {
    $el: (i) => i.vnode.el
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // 实现 setupState的获取
        const { setupState } = instance;
        if (key in setupState) { // key 就是"hi" + this.msg 这里的msg
            return setupState[key];
        }
        debugger;
        //  当调用$el时 key 就是$el
        // if (key === "$el") {
        // 	return instance.vnode.el; // 这种方式需要保证拿到的实例出来的vnode 的el存在
        // }
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
        setupState: {},
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
    // ctx  实现setupState 和 this.$el值的获取
    instance.proxy = new Proxy({ _: instance }, // 
    PublicInstanceProxyHandlers
    // {
    // 	get(target, key) {
    // 		const { setupState } = instance
    // 		if (key in setupState) {// key 就是"hi" + this.msg 这里的msg
    // 			return setupState[key];
    // 		}
    // 		debugger;
    // 		//  当调用$el时 key 就是$el
    // 		if (key === "$el") {
    // 			return instance.vnode.el; // 这种方式需要保证拿到的实例出来的vnode 的el存在
    // 		}
    // 	}
    // }
    );
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
        el: null, // 把根节点 el 存起来
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

export { createApp, h };
