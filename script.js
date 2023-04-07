// get canvas related references
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

//Set constants
const titleText = "This is a simple demonstration showing that the sum of interior angles of a triangle is always 180 degrees.";
const lineStroke = "black";
const lineStrokeWidth = 1;
const arcStrokeWidth = 1;
const arcRadius = 50;

//Create dots
const dots = [
	{
		x: canvasWidth / 2,
		y: canvasHeight / 2.2,
		radius: 15,
		fill: "forestgreen",
		isDragging: false,
	},
	{
		x: canvasWidth / 2.5,
		y: canvasHeight / 2.5,
		radius: 15,
		fill: "red",
		isDragging: false,
	},
	{
		x: canvasWidth / 3,
		y: canvasHeight / 1.5,
		radius: 15,
		fill: "blue",
		isDragging: false,
	}
];

//Drag related variables
let draging = false;
let mouseXOffset;
let mouseYOffset;

// listen for mouse events
canvas.onmousedown = myDown;
canvas.onmouseup = myUp;
canvas.onmousemove = myMove;
window.addEventListener('resize', myResize);

draw();

function draw() {
	clear();
	
	drawLine(dots[0], dots[1]);
	drawLine(dots[1], dots[2]);
	drawLine(dots[2], dots[0]);
	
	drawInteriorArc(dots[0], dots[1], dots[2]);
	drawInteriorArc(dots[1], dots[0], dots[2]);
	drawInteriorArc(dots[2], dots[1], dots[0]);
	
	let angleText1 = drawAngleText(dots[0], dots[1], dots[2]);
	let angleText2 = drawAngleText(dots[1], dots[0], dots[2]);
	let angleText3 = drawAngleText(dots[2], dots[1], dots[0], 180 - angleText1 - angleText2);
	
	drawDot(dots[0]);
	drawDot(dots[1]);
	drawDot(dots[2]);
	
	drawAnglesBottomText(angleText1, angleText2, angleText3);
	
	drawTitle(titleText);
}

function drawDot(dot) {
	ctx.fillStyle = dot.fill;
	ctx.beginPath();
	ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
	ctx.closePath();
	ctx.fill();
}

function drawLine(dotA, dotB) {
	ctx.strokeStyle = lineStroke;
	ctx.lineWidth = lineStrokeWidth;
	ctx.beginPath();
	ctx.moveTo(dotA.x, dotA.y);
	ctx.lineTo(dotB.x, dotB.y);
	ctx.stroke();
}

function drawArc(dot, a1, a2) {
	ctx.strokeStyle = dot.fill;
	ctx.lineWidth = arcStrokeWidth;
	ctx.beginPath();
	ctx.arc(dot.x, dot.y, arcRadius, a1, a2);
	ctx.stroke();
}

function angleBetweenDots(dotA, dotB) {
	let dy = dotB.y - dotA.y;
	let dx = dotB.x - dotA.x;
	let theta = Math.atan2(dy, dx); // range (-PI, PI]
	theta += Math.PI; // range (0, 2 PI]
	return theta;
}

function drawInteriorArc(thisDot, connectingDot1, connectingDot2) {
	let deltaA1 = angleBetweenDots(connectingDot1, thisDot);
	let deltaA2 = angleBetweenDots(connectingDot2, thisDot);
	
	if(deltaA1 > deltaA2) {
		if(((2 * Math.PI) - deltaA1) + deltaA2 > Math.PI) {
			drawArc(thisDot, deltaA2, deltaA1);
		} else {
			drawArc(thisDot, deltaA1, deltaA2);
		}
	} else {
		if(deltaA2 - deltaA1 > Math.PI) {
			drawArc(thisDot, deltaA2, deltaA1);
		} else {
			drawArc(thisDot, deltaA1, deltaA2);
		}
	}
}

function drawAngleText(thisDot, connectingDot1, connectingDot2, textOverride = undefined) {
	let deltaA1 = angleBetweenDots(connectingDot1, thisDot);
	let deltaA2 = angleBetweenDots(connectingDot2, thisDot);
	
	let x, y, angle;
	
	if(deltaA1 > deltaA2) {
		if(((2 * Math.PI) - deltaA1) + deltaA2 > Math.PI) {
			x = arcRadius * Math.cos(deltaA2 + ((deltaA1 - deltaA2) / 2));
			y = arcRadius * Math.sin(deltaA2 + ((deltaA1 - deltaA2) / 2));
			angle = absoluteAngle(deltaA1 - deltaA2);
		} else {
			x = arcRadius * -Math.cos(deltaA1 + ((deltaA2 - deltaA1) / 2));
			y = arcRadius * -Math.sin(deltaA1 + ((deltaA2 - deltaA1) / 2));
			angle = absoluteAngle(deltaA2 - deltaA1);
		}
	} else {
		if(deltaA2 - deltaA1 > Math.PI) {
			x = arcRadius * -Math.cos(deltaA2 + ((deltaA1 - deltaA2) / 2));
			y = arcRadius * -Math.sin(deltaA2 + ((deltaA1 - deltaA2) / 2));
			angle = absoluteAngle(deltaA1 - deltaA2);
		} else {
			x = arcRadius * Math.cos(deltaA1 + ((deltaA2 - deltaA1) / 2));
			y = arcRadius * Math.sin(deltaA1 + ((deltaA2 - deltaA1) / 2));
			angle = absoluteAngle(deltaA2 - deltaA1);
		}
	}
	
	let text = textOverride !== undefined ? textOverride : radToDeg(angle).toFixed();
	
	ctx.font = "16px Arial";
	
	let params = {
		context: ctx,
		text: text + "\u00B0",
		x: thisDot.x + x - (ctx.measureText(text + "\u00B0").width / 2),
		y: thisDot.y + y - 14,
		font: "16px Arial",
		fill: thisDot.fill,
		maxWidth: canvasWidth,
		padding: 5,
		useBackground: true,
	};
	
	drawMultilineText(params);
	
	return text;
}

function drawAnglesBottomText(angleText1, angleText2, angleText3) {
	ctx.font = "30px Arial";
	
	let textPieces = [
		angleText1 + "\u00B0",
		" + ",
		angleText2 + "\u00B0",
		" + ",
		angleText3 + "\u00B0",
		" = ",
		(Number(angleText1) + Number(angleText2) + Number(angleText3)) + "\u00B0",
	];
	
	let angle1TextWidth = ctx.measureText(textPieces[0]).width;
	let betweenAnglesTextWidth = ctx.measureText(textPieces[1]).width;
	let angle2TextWidth = ctx.measureText(textPieces[2]).width;
	let angle3TextWidth = ctx.measureText(textPieces[4]).width;
	let afterAnglesTextWidth = ctx.measureText(textPieces[5]).width;
	let anglesTotalWidth = ctx.measureText(textPieces[6]).width;
	let totalTextWidth = angle1TextWidth + betweenAnglesTextWidth + angle2TextWidth + betweenAnglesTextWidth + angle3TextWidth + afterAnglesTextWidth + anglesTotalWidth;
	
	params = {
		context: ctx,
		text: textPieces[0],
		font: "30px Arial",
		fill: dots[0].fill,
		maxWidth: canvasWidth,
		alignment: "left",
		padding: 5,
		x: (canvasWidth - totalTextWidth) / 2,
		y: canvasHeight - 50,
		useBackground: true,
	};
	
	drawMultilineText(params);
	
	params = {
		context: ctx,
		text: textPieces[1],
		font: "30px Arial",
		maxWidth: canvasWidth,
		alignment: "left",
		padding: 5,
		x: ((canvasWidth - totalTextWidth) / 2) + angle1TextWidth + 5,
		y: canvasHeight - 50,
		useBackground: true,
	};
	
	drawMultilineText(params);
	
	params = {
		context: ctx,
		text: textPieces[2],
		font: "30px Arial",
		fill: dots[1].fill,
		maxWidth: canvasWidth,
		alignment: "left",
		padding: 5,
		x: ((canvasWidth - totalTextWidth) / 2) + angle1TextWidth + 5 + betweenAnglesTextWidth,
		y: canvasHeight - 50,
		useBackground: true,
	};
	
	drawMultilineText(params);
	
	params = {
		context: ctx,
		text: textPieces[3],
		font: "30px Arial",
		maxWidth: canvasWidth,
		alignment: "left",
		padding: 5,
		x: ((canvasWidth - totalTextWidth) / 2) + angle1TextWidth + 5 + betweenAnglesTextWidth + 5 + angle2TextWidth,
		y: canvasHeight - 50,
		useBackground: true,
	};
	
	drawMultilineText(params);
	
	params = {
		context: ctx,
		text: textPieces[4],
		font: "30px Arial",
		fill: dots[2].fill,
		maxWidth: canvasWidth,
		alignment: "left",
		padding: 5,
		x: ((canvasWidth - totalTextWidth) / 2) + angle1TextWidth + 5 + betweenAnglesTextWidth + 5 + angle2TextWidth + 5 + betweenAnglesTextWidth,
		y: canvasHeight - 50,
		useBackground: true,
	};
	
	drawMultilineText(params);
	
	params = {
		context: ctx,
		text: textPieces[5],
		font: "30px Arial",
		maxWidth: canvasWidth,
		alignment: "left",
		padding: 5,
		x: ((canvasWidth - totalTextWidth) / 2) + angle1TextWidth + 5 + betweenAnglesTextWidth + 5 + angle2TextWidth + 5 + betweenAnglesTextWidth + 5 + angle3TextWidth,
		y: canvasHeight - 50,
		useBackground: true,
	};
	
	drawMultilineText(params);
	
	params = {
		context: ctx,
		text: textPieces[6],
		font: "30px Arial",
		maxWidth: canvasWidth,
		alignment: "left",
		padding: 5,
		x: ((canvasWidth - totalTextWidth) / 2) + angle1TextWidth + 5 + betweenAnglesTextWidth + 5 + angle2TextWidth + 5 + betweenAnglesTextWidth + 5 + angle3TextWidth + 5 + afterAnglesTextWidth,
		y: canvasHeight - 50,
		useBackground: true,
	};
	
	drawMultilineText(params);
}

function drawTitle(text) {
	let params = {
		context: ctx,
		text: text,
		font: "30px Arial",
		maxWidth: canvasWidth,
		alignment: "center",
		padding: 5,
		useBackground: true,
	};
	
	drawMultilineText(params);
}

function radToDeg(a) {
	return a * 180 / Math.PI;
}

function absoluteAngle(angleRad) {
	if(angleRad < 0) {
		angleRad += 2 * Math.PI;
	}
	
	return angleRad;
}

// clear the canvas
function clear() {
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

// handle mousedown events
function myDown(e){
	// tell the browser we're handling this mouse event
	e.preventDefault();
	e.stopPropagation();
	
	// get the current mouse position
	let mx = parseInt(e.clientX);
	let my = parseInt(e.clientY);
	
	// test each shape to see if mouse is inside
	draging = false;
	
	for(let i = 0; i < dots.length; i++){
		let dot = dots[i];
		
		let dx = dot.x - mx;
		let dy = dot.y - my;
		// test if the mouse is inside this circle
		if(dx * dx + dy * dy < dot.radius * dot.radius){
			draging = true;
			dot.isDragging = true;
			
			mouseXOffset = dx;
			mouseYOffset = dy;
			
			break;
		}
	}
}

// handle mouseup events
function myUp(e){
	// tell the browser we're handling this mouse event
	e.preventDefault();
	e.stopPropagation();
	
	// clear all the dragging flags
	draging = false;
	
	for(let i = 0;i < dots.length; i++){
		dots[i].isDragging = false;
	}
}

// handle mouse moves
function myMove(e){
	// if we're dragging anything...
	if(draging){
		// tell the browser we're handling this mouse event
		e.preventDefault();
		e.stopPropagation();
	
		// get the current mouse position
		let mx = parseInt(e.clientX);
		let my = parseInt(e.clientY);
	
		// move each rect that isDragging 
		// by the distance the mouse has moved
		// since the last mousemove
		for(let i = 0; i < dots.length; i++){
			let dot = dots[i];
			
			if(dot.isDragging){
				dot.x = mx + mouseXOffset;
				dot.y = my + mouseYOffset;
				
				break;
			}
		}
	
		// redraw the scene with the new rect positions
		draw();
	}
}

function myResize(e) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;
	
	draw();
}