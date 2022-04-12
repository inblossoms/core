import { camelize, toHandlerKey } from "../shared/index";

export const emit = (instance, event, ...args) => {
	console.log("emit", event);

	// instance.props  -> event
	const { props } = instance;

	//  TPP
	//  先梳理出特定行为  -> 重构成通用行为

	const handlerName = toHandlerKey(camelize(event))
	const handler = props[handlerName]
	handler && handler(...args)
};
