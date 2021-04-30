import virtualScrolling  from "./virtual-scrolling/virtual-scrolling.js";
import _                 from "./settings.js";
import {
	eHTML,
	generateUTF16Char,
	inTab,
} from "./util.js";

export {
	articleAPI,
	sidebarAPI,
};
_.countOfAllLines = Math.ceil((_.end - _.start) / _.rowLength);
_.countOfAllBlocks = Math.ceil((_.end - _.start) / _.blockLength);

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


function afterArticleRender(){
	sidebarAPI.setOnMiddle(
		Math.floor(inTab.the.block.ofRow(articleAPI.getMiddleFullyVisibleLineNum()))
	);
	const 
		first   = inTab.the.plane.ofRow(articleAPI.getFirstSemiVisibleLineNum()),
		last    = inTab.the.plane.ofRow(articleAPI.getLastSemiVisibleLineNum() );
	setPlanes(first, last);
}

function afterArticleScroll() {
	const 
		firstBlockNum = inTab.the.block.ofRow(articleAPI.getFirstFullyVisibleLineNum()),
		lastBlockNum  = inTab.the.block.ofRow(articleAPI.getLastFullyVisibleLineNum() ),
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

function setPlanes(...args) {
	document.querySelectorAll(".planes__plane-number").forEach((v) => {
		const num = parseInt(v.dataset.plane);
		if(args.includes(num))
			v.classList.add("marked");
		else
			v.classList.remove("marked");
	});
}


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
