<template>
    <div id="app">

		<expression-bar :code="code" @change="changeCode"></expression-bar>

		<graph :code="code"></graph>

		<div id="info_bar">
			<a href="https://github.com/JannisX11/molang-grapher" target="_blank">GitHub</a>
		</div>

    </div>
</template>

<script>
import ExpressionBar from './ExpressionBar'
import Graph from './Graph'

import './../util'

const default_code = 'Math.sin(query.anim_time * 90)';

export default {
	name: 'app',
	components: {ExpressionBar, Graph},
	data() {return {
		code: (localStorage.getItem('molang-grapher-code') || default_code)
	}},
	methods: {
		changeCode(code) {
			this.code = code;
			localStorage.setItem('molang-grapher-code', code);
		}
	}
}
</script>


<style>

	@import url('./../css/common.css');

	.tool {
		display: inline-block;
		padding: 2px 8px; 
		padding-top: 1px;
		width: 35px;
		height: 30px;
		cursor: pointer;
	}
	.tool:hover {
		color: var(--color-highlight);
	}
	.tool > i {
		pointer-events: none;
	}

</style>


<style scoped>
	div#app {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		position: fixed;
		font-weight: 400;
		background-color: var(--color-interface);
	}
	#expression_bar {
		flex: 0 0 auto;
	}
	#graph {
		flex: 1 0 100px;
	}
	#info_bar {
		flex: 0 0 27px;
		background-color: var(--color-dark);
		border-top: 1px solid var(--color-border);
	}
	#info_bar a {
		display: inline-block;
		padding: 2px 16px;
	}

</style>