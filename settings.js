export default {
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