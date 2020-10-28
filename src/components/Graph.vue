<template>
    <div id="graph" @mousedown="startDrag($event)" @wheel="scroll($event)">
		<svg>
			<path class="axes" :d="axes" />

			<path class="grid" :d="grid" />

			<path class="curve" :d="graph" />
		</svg>
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
		startDrag(event) {
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
			this.udpateGrid();
		},
		udpateGrid() {
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

			for (var x = 0; x < window.innerWidth; x += 2) {
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
		stroke-width: 2px;
	}
	path.curve {
		stroke: #f72858;
	}
	path.axes {
		stroke: var(--color-title);
	}
	path.grid {
		stroke-width: 1px;
		opacity: 0.4;
		stroke: var(--color-title);
	}
</style>

