import virtualScrolling from "./virtual-scrolling/virtual-scrolling.js";
import symbolModalWindow from "./symbol-modal-window.js";
import util              from "./util.js";

const {
	eHTML,
	getParentLine,
	selectElement,
	clearSelection,
	generateUTF16Char,
} = util;

const _ = {
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
};

_.countOfAllLines = Math.ceil((_.end - _.start) / _.rowLength);
_.countOfAllBlocks = Math.ceil((_.end - _.start) / _.blockLength);


font_fam.value = getComputedStyle(document.body).fontFamily;
font_indicator.textContent = getComputedStyle(font_indicator).fontFamily;


const 
	articleAPI = virtualScrolling(
		_.article, 
		getSymbolRowEl, 
		_.countOfAllLines, 
		_.cellH
	),
	sidebarAPI = virtualScrolling(
		_.sidebar, 
		getBlockNumLineEl, 
		_.countOfAllBlocks, 
		_.blockNumLineHeight
	);



articleAPI.onAfterRender = function(e){
	setTimeout(function() {
		afterArticleRender();
		afterArticleScroll();
	})

}

sidebarAPI.onAfterRender = function(e) {
	afterArticleScroll();
}

afterArticleRender();
afterArticleScroll();

// Events ↓

document.body.onclick = function h_BodyClick(e) {

	let t = e.target;
	do {
		if (t.classList.contains("block-num-line")) {
			articleAPI.setOnTop(t.dataset.blockNum * _.blockLength / _.rowLength);
		} else 
		if (t.classList.contains("smw-close-btn")) {
			symbolModalWindow.close();
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
				a = eHTML(`<a target="_blank" href="${url}">#</a>`);
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
			symbolModalWindow.open(prev);
			articleAPI.setOnMiddle(rowNum);
		} else
		if (t.classList.contains("smw-next-symbol-btn")) {
			var 
				mWin   = document.querySelector(".symbol-modal-window"),
				num    = mWin.dataset.number * 1,
				next   = num + 1,
				rowNum = Math.floor(next / _.rowLength);
			symbolModalWindow.open(next);
			articleAPI.setOnMiddle(rowNum);
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
		symbolModalWindow.close();
	} else if (e.target.classList.contains("open-smw")) {
		var
			cell = getParentLine(e.target).find((v) => v.dataset.charNum !== undefined),
			num = cell.dataset.charNum * 1;
		symbolModalWindow.open(num);
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
		symbolModalWindow.open(num);
		articleAPI.setOnMiddle(rowNum);

		t.select();
	}
}

document.querySelector("#sidebar").onwheel = function h_kNumWheel(e) {
	e.preventDefault();
	this.scrollTop += Math.sign(e.deltaY) * 35;
}

function afterArticleRender(){
	sidebarAPI.setOnMiddle(
		Math.floor(articleAPI.getMiddleFullyVisibleLineNum() * _.rowLength / _.blockLength)
	);
	
}

function afterArticleScroll() {
	const 
		firstBlockNum = Math.floor(articleAPI.getFirstFullyVisibleLineNum() * _.rowLength / _.blockLength),
		lastBlockNum = Math.floor(articleAPI.getLastFullyVisibleLineNum() * _.rowLength / _.blockLength),
		lines = _.sidebar.children[0].children,
		len   = lines.length;

	for (let i = 0; i < len; i++) {
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
	symbolModalWindow.setSymbolHeightData();
}

// Events ⭡



// Rendering functions ⭣

function getSymbolRowEl(lineNum) {
	return eHTML(getSymbolRowStr(lineNum));
}

function getSymbolBlokEl(blockNum) {
	var block = eHTML(`
		<div class="symbol-block">
			<div class="block-header"></div>
			<div class="block-body"></div>
			<div class="block-advertising-slot"></div>
		</div>
	`);
}

function getBlockNumLineEl(lineNum) {
	return eHTML(getBlockNumLineStr(lineNum));
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

