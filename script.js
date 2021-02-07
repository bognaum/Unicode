var _ = {
	cellW: 60,
	cellH: 60,

	blockNumLineHeight: 30,

	start : 0,
	end : 0x10FFFF,
	blockLength : 256,
	rowLength : 16,

	sidebar : document.querySelector("#sidebar"),
	article : document.querySelector("#article"),

	fontStyle : {
		textDecoration : "none",
		fontWeight : "normal",
		fontStyle : "normal",
		fontFamily : getComputedStyle(document.body).fontFamily,
	}
}

var cHtmlShell = document.createElement("div");

font_fam.value = getComputedStyle(document.body).fontFamily;
font_indicator.textContent = getComputedStyle(font_indicator).fontFamily;

_.countOfAllLines = Math.ceil((_.end - _.start) / _.rowLength);
_.countOfAllBlocks = Math.ceil((_.end - _.start) / _.blockLength);

var articleVS = virtualScrolling(_.article, getSymbolRowEl, _.countOfAllLines, _.cellH);
var sidebarVS = virtualScrolling(_.sidebar, getBlockNumLineEl, _.countOfAllBlocks, _.blockNumLineHeight);


articleVS.onAfterRender = function(e){
	setTimeout(function() {
		afterArticleRender();
		afterArticleScroll();
	})

}

sidebarVS.onAfterRender = function(e) {
	afterArticleScroll();
}

afterArticleRender();
afterArticleScroll();

// Events ↓

document.body.onclick = function h_BodyClick(e) {

	var t = e.target;
	do {
		if (t.classList.contains("block-num-line")) {
			articleVS.setOnTop(t.dataset.blockNum * _.blockLength / _.rowLength);
		} else 
		if (t.classList.contains("smw-close-btn")) {
			closeSymbolModalWindow();
		} else 
		if (t.classList.contains("smw-copy-symbol-btn")) {
			selectElement(document.querySelector(".smw-symbol"));
			document.execCommand("copy");
			setTimeout(clearSelection, 500);
		} else
		if (t.classList.contains("smw-googling-symbol-btn")) {
			var 
				symbol = document.querySelector(".smw-symbol").textContent,
				url = `https://www.google.com/search?q=${encodeURIComponent(symbol)}`,
				a = create(`<a target="_blank" href="${url}">#</a>`);
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
		} else
		if (t.classList.contains("smw-previous-symbol-btn")) {
			var 
				mWin   = document.querySelector(".symbol-modal-window"),
				num    = mWin.dataset.number * 1,
				prev   = (0 < num)? num - 1 : num,
				rowNum = prev     ? Math.floor(prev / _.rowLength) : 0;
			openSymbolModalWindow(prev);
			articleVS.setOnMiddle(rowNum);
		} else
		if (t.classList.contains("smw-next-symbol-btn")) {
			var 
				mWin   = document.querySelector(".symbol-modal-window"),
				num    = mWin.dataset.number * 1,
				next   = num + 1,
				rowNum = Math.floor(next / _.rowLength);
			openSymbolModalWindow(next);
			articleVS.setOnMiddle(rowNum);
		} else 
		if (t.id == "search_img_gliph") {
			var input = document.querySelector("#search_field");
			document.body.onchange({target: input});
		} else 
			continue;
		break;

	} while (t = t.parentElement);


	if (e.target.classList.contains("selectable")) {

		selectElement(e.target);
		document.execCommand("copy");
		setTimeout(clearSelection, 500);
	}

	if (e.target.classList.contains("smw-glass-cower")) {
		closeSymbolModalWindow();
	} else if (e.target.classList.contains("open-smw")) {
		var
			cell = getParentLine(e.target).find((v) => v.dataset.charNum !== undefined),
			num = cell.dataset.charNum * 1;
		openSymbolModalWindow(num);
	}

	if (e.target.classList.contains('set-font-list-item')) {
		font_fam.value = ''+e.target.textContent+'';
		_.fontStyle.fontFamily = font_fam.value;
		updateFontCss();
		// console.log(`e.target.textContent`, e.target.textContent);
	}
}

document.body.onchange = function h_BodyChange(e) {
	var t = e.target;
	if (t.classList.contains("update-fonts")) {

		if (t == text_decor)
			_.fontStyle.textDecoration = t.value;
		else
		if (t == font_bold)
			_.fontStyle.fontWeight = t.checked ? "bold" : "normal";
		else
		if (t == font_italic)
			_.fontStyle.fontStyle = t.checked ? "italic" : "normal";
		else
		if (t == font_fam)
			_.fontStyle.fontFamily = t.value;
		
		updateFontCss()
	} else
	if (t == search_field) {
		let v = e.target.value, num;

		if (!v) 
			return;
		
		if (v.charCodeAt() !== v.codePointAt()) {
			console.log("surrogate pare");
			num = v.codePointAt();
		} else if (v.length == 1) {
			console.log(`(v.length == 1)`);
			num = v.charCodeAt();
		} else if (v.startsWith("%u")) {
			console.log(`(v.startsWith("%u"))`);
			num = parseInt("0x"+v.slice(2));
		} else if (v.startsWith("%")) {
			console.log(`(v.startsWith("%")`);
			num = decodeURIComponent(v).charCodeAt();
		} else if (num = v * 1) {
			console.log(`(num = v * 1)`);
			num;
		} else {
			console.error("(!)-USER'S ", "'num' is not defined.\nnum : '"+num+"'");
		}

		let rowNum = Math.floor(num / _.rowLength);
		openSymbolModalWindow(num);
		articleVS.setOnMiddle(rowNum);

		t.select();
	}
}

document.querySelector("#sidebar").onwheel = function h_kNumWheel(e) {
	e.preventDefault();
	this.scrollTop += Math.sign(e.deltaY) * 35;
}

function afterArticleRender(){
	sidebarVS.setOnMiddle(
		Math.floor(articleVS.getMiddleFullyVisibleLineNum() * _.rowLength / _.blockLength)
	);
	
}

function afterArticleScroll() {
	var 
		firstBlockNum = Math.floor(articleVS.getFirstFullyVisibleLineNum() * _.rowLength / _.blockLength),
		lastBlockNum = Math.floor(articleVS.getLastFullyVisibleLineNum() * _.rowLength / _.blockLength),
		lines = _.sidebar.children[0].children;

	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		if (line.dataset.blockNum == firstBlockNum) {
			line.classList.add("marked");
		} else if (line.dataset.blockNum == lastBlockNum) {
			line.classList.add("marked");
		} else {
			// console.log(`line.classList`, line.classList);
			line.classList.remove("marked");
		}
	}
}

function updateFontCss() {
	const str = `
		.stylized {
			text-decoration: ${_.fontStyle.textDecoration};
			font-weight: ${_.fontStyle.fontWeight};
			font-style: ${_.fontStyle.fontStyle};
			font-family: ${_.fontStyle.fontFamily};
		}
	`;
	font_style_css.textContent = str;
	font_indicator.textContent = getComputedStyle(font_indicator).fontFamily;
	// document.head.appendChild(font_style_css);
	setSymbolHeightData();
}

// Events ⭡

// Symbol window functions ↓

function openSymbolModalWindow(num) {
	num = num * 1;
	var
		mWin = document.querySelector(".symbol-modal-window"),
		symbol = generateUTF16Char(num),
		str16 = num.toString(16).toUpperCase().padStart(4, "0"),
		ftCont = mWin.querySelector(".smw-features-site"),
		// bytesN = (num <= 0x7F)? 1 : (num <= 0x7FF)? 2 : (num <= 0xFFFF)? 3 : (num <= 0x10FFFF)? 4 : 5,
		bytesN = (num < 0x80)? 1 : (num < 0x800)? 2 : (num < 0x10000)? 3 : (num < 0x110000)? 4 : 5,
		uriCoded,
		uriComponentCoded,
		escapeCoded;
	try {
		uriCoded = encodeURI(symbol);
	} catch(err) {
		uriCoded = " - - - ";
	}
	try {
		uriComponentCoded = encodeURIComponent(symbol);
	} catch(err) {
		uriComponentCoded = " - - - ";
	}
	try {
		escapeCoded = escape(symbol);
	} catch(err) {
		escapeCoded = " - - - ";
	}
	mWin.classList.add("visible");
	mWin.dataset.number = num;
	document.querySelector("#article").classList.add("blured");
	document.querySelector("#sidebar").classList.add("blured");
	document.querySelector(".smw-symbol").textContent = symbol;
	ftCont.innerHTML = `
		<table>
			<tbody>
				<tr>
					<td>DEC</td>
					<td class="selectable">${num}</td>
				</tr>
				<tr>
					<td>0x</td>
					<td class="selectable">${num.toString(16).toUpperCase()}</td>
				</tr>
				<tr>
					<td>UTF-8</td>
					<td class="selectable">${getUTF8Code(num)}</td>
				</tr>
				<tr>
					<td>UTF-16BE</td>
					<td class="selectable">${getUTF16Code(num)}</td>
				</tr>
				<tr>
					<td>UTF-32BE</td>
					<td class="selectable">${getUTF32Code(num)}</td>
				</tr>
				<tr>
					<td>Unicode plane</td>
					<td class="selectable">${Math.ceil((num + 1) / 0x10000)}</td>
				</tr>
				<tr>
					<td>Line neight - subject (normal)</td>
					<td>
						<span class="selectable subj-lh-em"></span><span class="main-color">em</span>
						<span class="main-color">(</span
							><span class="selectable norm-lh-em"></span
						><span class="main-color">em)</span>
					</td>
				</tr>
				<tr>
					<td>HTML entity</td>
					<td class="selectable">&amp;#${num};</td>
				</tr>
				<tr>
					<td>JS string</td>
					<td class="selectable">\\u${str16}</td>
				</tr>
				<tr>
					<td>CSS content</td>
					<td class="selectable">\\${str16}</td>
				</tr>
				<tr>
					<td>URI</td>
					<td class="selectable">${uriCoded}</td>
				</tr>
				<tr>
					<td>URI component</td>
					<td class="selectable">${uriComponentCoded}</td>
				</tr>
				<tr>
					<td>escape</td>
					<td class="selectable">${escapeCoded}</td>
				</tr>
			</tbody>
		</table>
	`;
	
	setSymbolHeightData()
}

function setSymbolHeightData() {
	const 
		mWin = document.querySelector(".symbol-modal-window"),
		table = {
			"subj-line-height" : mWin.querySelector(".subj-lh-em"),
			"norm-line-height" : mWin.querySelector(".norm-lh-em"),
		},
		symbols = {
			normal : mWin.querySelector(".smw-standard-character"),
			subject : mWin.querySelector(".smw-symbol")
		};

	const 
		normFZ  = parseFloat(getComputedStyle(symbols.normal).fontSize),
		subjFZ  = parseFloat(getComputedStyle(symbols.subject).fontSize),
		fz      = subjFZ,


		normBCR = symbols.normal.getBoundingClientRect(),
		normH   = normBCR.height,
		normT   = normBCR.top,
		normB   = normBCR.bottom,

		subjBCR = symbols.subject.getBoundingClientRect(),
		subjH   = subjBCR.height,
		subjT   = subjBCR.top,
		subjB   = subjBCR.bottom;

	table["subj-line-height"].textContent = subjH / fz;
	table["norm-line-height"].textContent = normH / fz;
}

function closeSymbolModalWindow() {
	document.querySelector(".symbol-modal-window").classList.remove("visible");
	document.querySelector("#article").classList.remove("blured");
	document.querySelector("#sidebar").classList.remove("blured");
}

// Symbol window functions ⭡

// Rendering functions ⭣

function getSymbolRowEl(lineNum) {
	return create(getSymbolRowStr(lineNum));
}

function getSymbolBlokEl(blockNum) {
	var block = create(`
		<div class="symbol-block">
			<div class="block-header"></div>
			<div class="block-body"></div>
			<div class="block-advertising-slot"></div>
		</div>
	`);
}

function getBlockNumLineEl(lineNum) {
	return create(getBlockNumLineStr(lineNum));
}


function getSymbolCellStr(num) {
	var
		symbol = generateUTF16Char(num),
		str16 = num.toString(16).toUpperCase().padStart(4, "0");

	return `
		<div 
			class="symbol-cell"
			data-char-num="${num}" 
			style="
				width: ${_.cellW}px; 
				height: ${_.cellH}px; 
				box-sizing: border-box;
				margin: 0;
			"
			/*title="${num+" 0x"+str16}"*/
			title="${"0x"+num.toString(16).toUpperCase()+"\n  "+num}"
		>
			<div class="flex-wr open-smw">
				<div class="symbol-wr open-smw">
					<div class="b-line-wr"><div class="b-line"></div></div><div class="symbol selectable stylized open-smw">${symbol}</div>
				</div>
			</div>
		</div>
	`;
}

function getSymbolRowStr(lineNum) {
	var
		start = lineNum * _.rowLength,
		end = start + _.rowLength,
		str = "";

	for (var i = start; i < end; i++) {
		str += getSymbolCellStr(i);
	}

	return `
		<div class="symbol-row">${str}</div>
	`;
}

function getBlockNumLineStr(lineNum) {
	const 
		str = lineNum.toString(16).toUpperCase().padStart(4, "0"),
		planeStr = str.slice(0,2),
		blockStr = str.slice(2, 4);

	return `
		<div 
			class="block-num-line"
			style="
				height: ${_.blockNumLineHeight}px;
			"
			data-block-num="${lineNum}" 
		><span class="plane-num" title="plane">${planeStr}</span> &nbsp;
			<span class="block-num" title="block">${blockStr}<span class="xx">XX</span></span></div>
	`;
}

// Rendering functions ⭡

// General purpose functions ⭣

function create(html) {
	cHtmlShell.innerHTML = html;
	return cHtmlShell.children[0];
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