import { ShapeFlags } from "../shared/ShapeFlags"

export function initSlots(instance, children: any) {
	// children object
	// instance.slots = Array.isArray(children) ? children : [children];
	const { vnode } = instance
	if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
		normalizeObjectSlots(children, instance.slots)
	}

};

function normalizeObjectSlots(children: any, slots: any) {
	for (const key in children) {
		const value = children[key]
		//  vlaue ==> slot
		slots[key] = (props) => normalizeSlotValue(value(props))
	}
}

function normalizeSlotValue(value) {
	return Array.isArray(value) ? value : [value]
}