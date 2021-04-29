export default {
	eHTML,
	getParentLine,
	selectElement,
	clearSelection,
	generateUTF16Char,
	getUTF8Code,
	getUTF16Code,
	getUTF32Code,
	codingByTempl,
};

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
	var t = 
		num < 0x10000  ? "xxxxxxxx xxxxxxxx" :
		num < 0x110000 ? "110110xx xxxxxxxx 110111xx xxxxxxxx" :
			null;

	if (!t)
		console.error("(!)-USER'S ", "getUTF16Code("+num+")", 
			"Maximum number exceeded.", "Max number =", 0x110000 - 1, 
			"Received argument =", num);

	return codingByTempl(t, num);
}

function getUTF32Code(num) {
	var t = 
		num < 0x110000  ? "xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx" :
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