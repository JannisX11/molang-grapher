<template>
    <div id="expression_bar">
		<prism-editor
			v-model="content"
			@change="updateInput($event)"
			:language="language"
			:autocomplete="autocomplete"
			:highlight="highlighter"
			:line-numbers="true"
			ref="input"
		/>
    </div>
</template>

<script>
import "prismjs";
import syntax from 'molangjs/syntax/molang-prism-syntax';

import Prism from 'prismjs/components/prism-core';
import "prismjs/themes/prism-okaidia.css";

import 'root/packages/vue-prism-editor/dist/prismeditor.min.css';
import {PrismEditor} from "root/packages/vue-prism-editor";

import getAutocompleteData from './../molang_autocomplete'

const Language = {
	'string': /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
	'function-name': /\b(?!\d)math\.\w+(?=[\t ]*\()/i,
	'selector': /\b(?!\d)(query|variable|temp|context|math|q|v|t|c)\.\w+/i,
	'boolean': /\b(?:true|false)\b/i,
	'number': /(?:\b\d+(?:\.\d+f?)?(?:[ed][+-]\d+)?|&h[a-f\d]+)\b/i,
	'operator': /&&|\|\||[-+*/!<>]=?|[:?=]/i,
	'keyword': /\b(return|loop|for_each|break|continue)\b/i,
	'punctuation': /[.,;()[\]{}]/,
};

const ExpandedInput = {
    input: 0,
	axis: null,
	updateText(test) {

	},
	setup: false,
}

export default {
	name: 'expression-bar',
	components: {PrismEditor},
	props: {
		code: String
	},
	data() {return {
		content: '',
		language: 'molang'
	}},
	methods: {
		autocomplete(text, position) {
			return getAutocompleteData(text, position, 'input')
		},
		highlighter() {
			return Prism.highlight(this.code, Language)
		},
		updateInput(text) {
			this.$emit('change', text)
		}
	},
	mounted() {
		this.content = this.code;
	}
}
export {ExpandedInput}

</script>

<style scoped>
	#expression_bar {
		width: 100%;
		height: 32px;
		padding-left: 4px;
		background-color: var(--color-dark);
		border-bottom: 1px solid var(--color-border);
		height: auto;
		z-index: 3;
	}
	#expression_bar input {
		background-color: transparent;
		width: 100%;
		border: none;
		height: 32px;
		padding: 5px 8px;
		opacity: 0.8;
		float: left;
		color: white;
	}
	#expression_bar input:focus {
		opacity: 1;
	}
</style>>

<style>
	#expression_bar .prism-editor-wrapper {
		overflow-y: hidden;
		min-height: 30px;
	}
	#expression_bar pre {
		padding: 4px;
		min-height: 30px;
		background-color: transparent;
		cursor: default;
	}
	#expression_bar pre code {
		color: #bec2ca;
		padding: 0;
		cursor: auto;
	}

	#expression_bar pre .token.punctuation {
		color: #5ba8c5
	}
	#expression_bar pre .token.operator, #expression_bar pre .token.keyword {
		color: #fc2f40
	}
	#expression_bar pre .token.number, #expression_bar pre .token.boolean {
		color: #b99cff
	}
	#expression_bar pre .token.function-name {
		color: #94e400
	}
	#expression_bar pre .token.selector {
		color: #92dcff;
	}
	#expression_bar .prism-editor__line-number {
		height: 21px;
	}
	#expression_bar .prism-editor__line-numbers {
		padding-right: 10px;
	}
</style>
