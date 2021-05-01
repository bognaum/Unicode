import _ from "./settings.js";

export {
	eHTML,
	getParentLine,
	selectElement,
	clearSelection,
	generateUTF16Char,
	getUTF8Code,
	getUTF16Code,
	getUTF32Code,
	codingByTempl,
	inTab,
};


const inTab_template = {
	the  : function() {return 0;},
	first: function() {return 0;},
	last : function() {return 1;},
	proto: {
		point: function(range) {
			const i = this();
			return range[i];
		},
		row: function(range) {
			const i = this();
			return Math.floor(range[i] / _.rowLength);
		},
		block: function(range) {
			const i = this();
			return Math.floor(range[i] / _.blockLength);
		},
		plane: function(range) {
			const i = this();
			return Math.floor(range[i] / _.planeLength);
		},
		proto: {
			ofPoint: function(num) {
				num = parseInt(num);
				return this([
					num,
					num
				]);
			},
			ofRow: function(num) {
				num = parseInt(num);
				return this([
					num * _.rowLength, 
					(num + 1) * _.rowLength - 1
				]);
			},
			ofBlock: function(num) {
				num = parseInt(num);
				return this([
					num * _.blockLength, 
					(num + 1) * _.blockLength - 1
				]);
			},
			ofPlane: function(num) {
				num = parseInt(num);
				return this([
					num * _.planeLength, 
					(num + 1) * _.planeLength - 1
				]);
			}
		}
	}
}

const inTab = assemblyLongAPI(inTab_template);

window.inTab = inTab;

function assemblyLongAPI(templ, api={}) {
	recur(api, templ);
	return api;
	function recur(func, t) {
		for (let i in t) {
			if (i == "proto") {
				continue;
			} else {
				let method  = t[i];
				func[i] = method.bind(func);
				if (t["proto"]) {
					recur(func[i], t["proto"]);
				}
			}
		}
		
	}
}

function eHTML(code, shell=null) {
	const _shell = 
		! shell                  ? document.createElement("div") :
		typeof shell == "string" ? document.createElement(shell) :
		typeof shell == "object" ? shell :
			null;
	_shell.innerHTML = code;
	return _shell.children[0];
}

function getParentLine(el) {
	var arr = [el];
	while (el = el.parentElement)
		arr.push(el);
	return arr;
}

function selectElement(el) {
	var 
		// r = new Range(),
		r = document.createRange(),
		s = window.getSelection();
		
	r.selectNodeContents(el);
	s.removeAllRanges();
	s.addRange(r);
	console.log(s.toString());
	return s.toString();
}

function clearSelection() {
	var 
		s = window.getSelection(),
		text = s.toString();
	s.removeAllRanges();
	return text;
}

function generateUTF16Char(num) {
	if (num < 0x10000)
		return String.fromCharCode(num);
	else if (num < 0x110000) {
		num = num - 0x10000;
		var 
			num1 = 0xD800 + ((num & 0xFFC00) >>> 10),
			num2 = 0xDC00 + (num & 0x3FF);
		return String.fromCharCode(num1)+String.fromCharCode(num2);
	} else {
		return "Err";
	}
}

function getUTF8Code(num) {
	var t = 
		num < 0x80     ? "0xxxxxxx":
		num < 0x800    ? "110xxxxx 10xxxxxx":
		num < 0x10000  ? "1110xxxx 10xxxxxx 10xxxxxx":
		num < 0x110000 ? "11110xxx 10xxxxxx 10xxxxxx 10xxxxxx":
			null;

	if (!t)
		console.error("(!)-USER'S ", "getUTF8Code("+num+")", 
			"Maximum number exceeded.", "Max number =", 0x110000 - 1, 
			"Received argument =", num);

	return codingByTempl(t, num);
}

function getUTF16Code(num) {
	if (num < 0x10000) 
		return codingByTempl("xxxxxxxx xxxxxxxx", num);
	
	else if (num < 0x110000) 
		return codingByTempl(
			"110110xx xxxxxxxx 110111xx xxxxxxxx", num - 0x10000);
	
	else {
		console.error("(!)-USER'S ", "getUTF16Code("+num+")", 
			"Maximum number exceeded.", "Max number =", 0x110000 - 1, 
			"Received argument =", num);
		return null;
	}
}

function getUTF32Code(num) {
	var t = 
		num < 0x110000  ? "00000000 000xxxxx xxxxxxxx xxxxxxxx" :
			null;

	if (!t)
		console.error("(!)-USER'S ", "getUTF32Code("+num+")", 
			"Maximum number exceeded.", "Max number =", 0x110000 - 1, 
			"Received argument =", num);

	return codingByTempl(t, num);
}

function codingByTempl(t, num) {
	var 
		bin = num.toString(2).split(""), 
		code = [];

	for (var i = t.length - 1; -1 < i ; i --) 
		code[i] = 
			t[i] == "x" ? `<span class="data-bit"><span>${bin.pop() || "0"}</span></span>` : 
			t[i] == " " ? `</span><span class="byte">` : 
				`<span class="sp-bit"><span>${t[i]}</span></span>`;
	
	return `<span class="byte">${code.join("")}</span>`;
}

// General purpose functions ⭡
