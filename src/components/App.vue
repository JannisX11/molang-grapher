<template>
    <div id="app">

		<expression-bar :code="code" @change="changeCode"></expression-bar>
		<graph :code="code"></graph>

    </div>
</template>

<script>
import ExpressionBar from './ExpressionBar'
import Graph from './Graph'

import './../util'


export default {
	name: 'app',
	components: {ExpressionBar, Graph},
	data() {return {
		code: (localStorage.getItem('molang-grapher-code') || '')
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

</style>