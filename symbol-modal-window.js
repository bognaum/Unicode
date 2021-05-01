import {
	generateUTF16Char,
	getUTF8Code,
	getUTF16Code,
	getUTF32Code,
} from "./util.js";


export default {
	open,
	close,
	setSymbolHeightData,
}

function open(num) {
	num = num * 1;
	var
		mWin = document.querySelector(".symbol-modal-window"),
		symbol = generateUTF16Char(num),
		str16 = num.toString(16).toUpperCase().padStart(4, "0"),
		ftCont = mWin.querySelector(".smw__features-site"),
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
	document.querySelector(".smw__symbol").textContent = symbol;
	ftCont.innerHTML = `
		<table>
			<tbody>
				<tr>
					<td>DEC</td>
					<td class="selectable">${num}</td>
				</tr>
				<tr>
					<td>HEX</td>
					<td class="selectable"><span class="main-color">0x</span>${num.toString(16).toUpperCase()}</td>
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
			normal : mWin.querySelector(".smw__standard-character"),
			subject : mWin.querySelector(".smw__symbol")
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

function close() {
	document.querySelector(".symbol-modal-window").classList.remove("visible");
	document.querySelector("#article").classList.remove("blured");
	document.querySelector("#sidebar").classList.remove("blured");
}

// Symbol window functions ⭡