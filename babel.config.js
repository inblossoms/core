module.exports = {
	presets: [['@babel/preset-env', { targets: { node: 'current' } }],// 通知bable以环境当前node的版本为基准
		'@babel/preset-typescript',// 配置 在环境使用 ts
	],
};