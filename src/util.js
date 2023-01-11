function bbuid(l) {
	l = l || 1
	let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
	var s = '';
	while (l > 0) {
		var n = Math.floor(Math.random()*62)
		if (n > 9) {
			n = chars[n-10]
		}
		s += n
		l--;
	}
	return s;
}
function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
}


Math.clamp = (number, min, max) => {
	if (number > max) number = max;
	if (number < min || isNaN(number)) number = min;
	return number;
}
Math.randomab = function(a, b) {
	return a + Math.random() * (b-a)
}
Math.radToDeg = function(rad) {
	return rad / Math.PI * 180
}
Math.degToRad = function(deg) {
	return Math.PI / (180 /deg)
}
Math.roundTo = function(num, digits) {
	var d = Math.pow(10,digits)
	return Math.round(num * d) / d
}
Math.lerp = function(a,b,m) {
	return (m-a) / (b-a)
}
Math.isBetween = function(n, a, b) {
   return (n - a) * (n - b) <= 0
}
Math.trimDeg = function(a) {
	return (a+180*15)%360-180
}
Math.isPowerOfTwo = function(x) {
	return (x > 1) && ((x & (x - 1)) == 0);
}

// Array
Array.prototype.safePush = function(item) {
	if (!this.includes(item)) {
		this.push(item);
		return true;
	}
	return false;
}
Array.prototype.equals = function (array) {
	if (!array)
			return false;

	if (this.length != array.length)
			return false;

	for (var i = 0, l=this.length; i < l; i++) {
			if (this[i] instanceof Array && array[i] instanceof Array) {
					if (!this[i].equals(array[i]))
							return false;			 
			}					 
			else if (this[i] != array[i]) { 
					return false;	 
			}					 
	}			 
	return true;
}
Array.prototype.remove = function (item) { {
	var index = this.indexOf(item)
	if (index > -1) {
		this.splice(index, 1)
		return index;
	}
	return false;
	}		
}
Array.prototype.empty = function() {
	this.splice(0, Infinity)
	return this;
}
Array.prototype.purge = function() {
	this.splice(0, Infinity)
	return this;
}
Array.prototype.findInArray = function(key, value) {
	for (var i = 0; i < this.length; i++) {
		if (this[i][key] === value) return this[i]
	}
	return false;
}
Array.prototype.positiveItems = function() {
	var x = 0, i = 0;
	while (i < this.length) {
		if (this[i]) x++;
		i++;
	}
	return x;
}
Array.prototype.allEqual = function(s) {
	var i = 0;
	while (i < this.length) {
		if (this[i] !== s) {
			return false;
		}
		i++;
	}
	return true;
}
Array.prototype.random = function() {
	return this[Math.floor(Math.random()*this.length)]
}

//String

function pathToName(path, extension) {
	var path_array = path.split('/').join('\\').split('\\')
	if (extension === true) {
		return path_array[path_array.length-1]
	} else if (extension === 'mobs_id') {
		var name = path_array[path_array.length-1].split('.').slice(0, -1).join('.')
		if (name === 'mobs' && path_array[path_array.length-3]) {
			name = name + ' (' + path_array[path_array.length-3].substr(0,8) + '...)'
		}
		return name
	} else {
		return path_array[path_array.length-1].replace(/\.\w+$/, '')
	}
}
function pathToExtension(path) {
	var matches = path.match(/\.\w{2,24}$/)
	if (!matches || !matches.length) return '';
	return matches[0].replace('.', '').toLowerCase()
}



//JSON
function compileJSON(object, options) {
	var output = ''
	if (typeof options !== 'object') options = {}
	function newLine(tabs) {
		if (options.small === true) {return '';}
		var s = '\n'
		for (var i = 0; i < tabs; i++) {
			s += '\t'
		}
		return s;
	}
	function handleVar(o, tabs) {
		var out = ''
		if (typeof o === 'string') {
			//String
			out += '"' + o.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n|\r\n/g, '\\n').replace(/\t/g, '\\t') + '"'
		} else if (typeof o === 'boolean') {
			//Boolean
			out += (o ? 'true' : 'false')
		} else if (typeof o === 'number') {
			//Number
			o = (Math.round(o*100000)/100000).toString()
			out += o
		} else if (o === null || o === Infinity || o === -Infinity) {
			//Null
			out += 'null'
		} else if (typeof o === 'object' && o instanceof Array) {
			//Array
			var has_content = false
			out += '['
			for (var i = 0; i < o.length; i++) {
				var compiled = handleVar(o[i], tabs+1)
				if (compiled) {
					var breaks = typeof o[i] === 'object'
					if (has_content) {out += ',' + (breaks || options.small?'':' ')}
					if (breaks) {out += newLine(tabs)}
					out += compiled
					has_content = true
				}
			}
			if (typeof o[o.length-1] === 'object') {out += newLine(tabs-1)}
			out += ']'
		} else if (typeof o === 'object') {
			//Object
			var breaks = o.constructor.name !== 'oneLiner';
			var has_content = false
			out += '{'
			for (var key in o) {
				if (o.hasOwnProperty(key)) {
					var compiled = handleVar(o[key], tabs+1)
					if (compiled) {
						if (has_content) {out += ',' + (breaks || options.small?'':' ')}
						if (breaks) {out += newLine(tabs)}
						out += '"' + key + '":' + (options.small === true ? '' : ' ')
						out += compiled
						has_content = true
					}
				}
			}
			if (breaks && has_content) {out += newLine(tabs-1)}
			out += '}'
		}
		return out;
	}
	return handleVar(object, 1)
}

export {
	bbuid, guid,
	compileJSON,
	pathToExtension,
	pathToName
}
