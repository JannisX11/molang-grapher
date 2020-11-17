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
		<div class="zero_dot" v-for="time in zero_points" :key="time" :style="{'left': (posX + time * scale) + 'px', 'top': posY + 'px'}"></div>
		<div class="zero_dot" v-if="(posY + Y_axis_cross * scale) > 0 && (posY + Y_axis_cross * scale) < sizeY" :style="{'left': posX + 'px', 'top': (posY + Y_axis_cross * scale) + 'px'}"></div>
    </div>
</template>

<script>

import Molang from 'molangjs';
const MolangParser = new Molang();

global.Molang = MolangParser;

let X = 0;
const X_variables = [
	'query.anim_time',
	'query.life_time',
	'time',
	'query.modified_distance_moved',
	'variable.particle_age',
	'variable.emitter_age'
]
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
		zero_points: [],
		Y_axis_cross: 0,
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

			let rounding = Math.round(this.scale / 24) * 12;
			X = (event.clientX - rect.left - this.posX) / this.scale;
			let found_zero_point = false;
			for (var time of [0, ...this.zero_points]) {
				if (Math.abs(time - X) < (6 / this.scale)) {
					X = time;
					found_zero_point = true;
					break;
				}
			}
			if (!found_zero_point) X = Math.round(X * rounding) / rounding;

			let val = MolangParser.parse(this.code);
			
			this.hover_note = `${Math.roundTo(X, 3)} / ${Math.roundTo(val, 3)}`;
			this.hover_note_X = this.posX + X   * this.scale;
			this.hover_note_Y = this.posY - val * this.scale;
		},
		exitCurve(event) {
			this.hover_note = '';
		},
		startDrag(event) {
			if (event.target.nodeName != 'svg') return;
			let scope = this;
			let original_pos = [this.posX, this.posY]
			function drag(e) {
				scope.posX = Math.round(original_pos[0] + e.clientX - event.clientX);
				scope.posY = Math.round(original_pos[1] + e.clientY - event.clientY);
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

            this.posX += Math.round(factor * (event.clientX - rect.left - this.posX));
            this.posY += Math.round(factor * (event.clientY - rect.top - this.posY));

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
			X = 0;
			this.zero_points.splice(0, Infinity);
			this.Y_axis_cross = -MolangParser.parse(this.code);

			let path = `M${this.posX} ${this.posY}`;
			let before = 0;
			for (var x = 0; x < window.innerWidth; x += 1) {
				X = (x - this.posX) / this.scale;
				let val = -MolangParser.parse(this.code);

				path += (x && !isNaN(val) && !isNaN(before)) ? ' L' : 'M';
				path += `${ x } ${ Math.clamp((this.posY + val * this.scale), -30, window.innerHeight) }`;

				// Zero Points
				if (val == 0 && before != 0) {
					this.zero_points.safePush(X);
				} else if ((before > 0 && val < 0) || (before < 0 && val > 0)) {
					let lerp = 1 / ((val - before) / val);
					this.zero_points.safePush(X - lerp/this.scale);
				}
				
				before = val;
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
	#graph {
		position: relative;
	}
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
	.zero_dot {
		position: absolute;
		pointer-events: none;
		background-color: #f72858;
		height: 6px;
		width: 6px;
		margin: -3px;
		border-radius: 3px;
	}
	#hover_note {
		position: absolute;
		pointer-events: none;
		background-color: aliceblue;
		color: #99a;
		padding: 5px;
		border-radius: 5px;
		z-index: 2;
	}
	#hover_dot {
		position: absolute;
		pointer-events: none;
		background-color: #f72858;
		height: 10px;
		width: 10px;
		margin: -5px;
		border-radius: 5px;
		z-index: 2;
	}
</style>

