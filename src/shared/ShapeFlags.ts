export const enum ShapeFlags {
	ELEMENT = 1, // 0001
	STATEFUL_COMPONENT = 1 << 1,// 0010
	TEXT_CHILDREN = 1 << 2,
	ARRRAY_CHILDREN = 1 << 3,
	SLOT_CHILDREN = 1 << 4
}

