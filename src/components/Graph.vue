<template>
    <div id="graph" @mousedown="startDrag($event)" @wheel="scroll($event)" @contextmenu.prevent>
		<svg>
			<path class="axes" :d="axes" />

			<path class="grid" :d="grid" />

			<path class="curve_hover" :d="graph" @mouseenter="hoverCurve($event)" @mousemove="hoverCurve($event)" @mouseleave="exitCurve($event)" />
			<path class="curve" :d="graph" />
		</svg>
		<div id="hover_note" v-if="hover_note" :style="{'left': hover_note_X + 'px', 'top': (hover_note_Y - 35) + 'px'}">{{hover_note}}</div>
		<div id="hover_dot" v-if="hover_note" :style="{'left': hover_note_X + 'px', 'top': hover_note_Y + 'px'}"></div>
    </div>
</template>

<script>

import Molang from 'molangjs';
const MolangParser = new Molang();

let X = 0;
const X_variables = ['query.anim_time', 'time', 'query.modified_distance_moved', 'variable.particle_age', 'variable.emitter_age']
MolangParser.variableHandler = function(variable) {
	if (X_variables.includes(variable)) {
		return X;
	}
}


export default {
	name: 'graph',
	props: {
		code: String,
	},
	data() {return {
		graph: '',
		axes: '',
		grid: '',
		scale: 100,
		posX: window.innerWidth/8,
		posY: window.innerHeight/2,
		hover_note: '',
		hover_note_X: 0,
		hover_note_Y: 0,
		hover_dot_X: 0,
		hover_dot_Y: 0,
	}},
	watch: {
		code(code) {
			this.updateGraph();
		}
	},
	computed: {
		sizeX() {
			return window.innerWidth;
		},
		sizeY() {
			return window.innerHeight;
		}
	},
	methods: {
		hoverCurve(event) {
			var rect = this.$el.getBoundingClientRect();
			let rounding = Math.round(this.scale);
			X = (event.clientX - rect.left - this.posX) / this.scale;
			X = Math.round(X * rounding) / rounding;
			let val = MolangParser.parse(this.code);
			
			this.hover_note = `${Math.roundTo(X, 4)} / ${Math.roundTo(val, 4)}`;
			this.hover_note_X = this.posX + X   * this.scale + rect.left;
			this.hover_note_Y = this.posY + val * this.scale + rect.top;
		},
		exitCurve(event) {
			this.hover_note = '';
		},
		startDrag(event) {
			if (event.target.nodeName != 'svg') return;
			let scope = this;
			let original_pos = [this.posX, this.posY]
			function drag(e) {
				scope.posX = original_pos[0] + e.clientX - event.clientX;
				scope.posY = original_pos[1] + e.clientY - event.clientY;
				scope.updateView();
			}
			function stop(e) {
				document.removeEventListener('mousemove', drag)
				document.removeEventListener('mouseup', stop)
			}
			document.addEventListener('mousemove', drag)
			document.addEventListener('mouseup', stop)
		},
		scroll(event) {
			let old_scale = this.scale;
            if (event.deltaY > 0) {
                this.scale /= 1.1
            } else {
                this.scale *= 1.1
            }
            this.scale = Math.clamp(this.scale, 5, 1000)

			let factor = (1-this.scale/old_scale);
			var rect = this.$el.getBoundingClientRect();

            this.posX += factor * (event.clientX - rect.left - this.posX);
            this.posY += factor * (event.clientY - rect.top - this.posY);

			this.updateView();
		},
		updateView() {
			this.updateGraph();
			this.updateGrid();
		},
		updateGrid() {
			// Axes
			this.axes = `M0 ${this.posY} L${window.innerWidth} ${this.posY}
				M${this.posX} 0 L${this.posX} ${window.innerHeight}`;

			// Grid
			this.grid = ``;
			for (var x = this.posX % this.scale; x < window.innerWidth; x += this.scale) {
				this.grid += `M${ x } 0 L${ x } ${window.innerHeight} `;
			}
			for (var y = this.posY % this.scale; y < window.innerHeight; y += this.scale) {
				this.grid += `M0 ${ y } L${window.innerWidth} ${ y } `;
			}
		},
		updateGraph() {
			let path = `M${this.posX} ${this.posY}`;

			for (var x = 0; x < window.innerWidth; x += 1) {
				X = (x - this.posX) / this.scale;
				let val = MolangParser.parse(this.code);

				path += x ? ' L' : 'M';
				path += `${ x } ${ this.posY + val * this.scale }`;
			}
			this.graph = path;
		}
	},
	mounted() {
		window.addEventListener('resize', (e) => {
			this.updateView();
		})
		this.updateView();
	}
}

</script>

<style scoped>
	svg {
		width: 100%;
		height: 100%;
	}
	path {
		fill: none;
	}
	path.curve {
		stroke: #f72858;
		pointer-events: none;
		stroke-width: 2px;
	}
	path.curve_hover {
		stroke: transparent;
		stroke-width: 14px;
	}
	path.axes {
		pointer-events: none;
		stroke: var(--color-title);
		stroke-width: 2px;
	}
	path.grid {
		pointer-events: none;
		stroke-width: 1px;
		opacity: 0.4;
		stroke: var(--color-title);
	}
	#hover_note {
		position: absolute;
		pointer-events: none;
		background-color: aliceblue;
		color: #99a;
		padding: 5px;
		border-radius: 5px;
		transition: left 100ms linear, top 100ms linear;
	}
	#hover_dot {
		position: absolute;
		pointer-events: none;
		background-color: #f72858;
		height: 8px;
		width: 8px;
		margin: -4px;
		border-radius: 4px;
		transition: left 100ms linear, top 100ms linear;
	}
</style>

