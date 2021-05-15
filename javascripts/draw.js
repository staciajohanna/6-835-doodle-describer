var cursor = new Cursor();
var LEAPSCALE = 0.6;
setupUserInterface();

// Adapted from https://developer-archive.leapmotion.com/leapjs/examples/draw.html
// Setup Leap loop with frame callback function
var controllerOptions = { enableGestures: true },
    width = 400,
    height = 400,
    canvas = d3.select('#canvas-body')
        .append('canvas')
        .attr('width', width)
        .attr('height', height)
        .attr("style", "outline: thin solid white;")
        .attr("style", "background-color: white;").node(),
    ctx = canvas.getContext('2d'),
    before = {},
    after = {};

ctx.lineWidth = 5;
ctx.translate(width/2, height/2 + 210);

var isLeftHandDetected = false;
var isLeftHandOpenPalm = false;
var isSpaceBarPressed = false;

// For drawing
var hasDrawn = false;
var coordX = [];
var coordY = [];
var imageData = [];

var warningDiv = document.getElementById("leap-warning");
var drawingCommandDiv = document.getElementById("drawing-command");
var drawingDescDiv = document.getElementById("doodle-description");

function saveAllPointsBetween2Points(xStart, yStart, xEnd, yEnd) {
    var dx = xEnd-xStart;
    var dy = yEnd-yStart;
    var ptCount = parseInt(Math.sqrt(dx*dx + dy*dy))*3;
    var lastX = -10000;
    var lastY = -10000;
    let tempX = [];
    let tempY = [];
    if (xStart) {
        coordX.push(xStart);
        coordY.push(yStart);
    }
    for (let i=1;i<=ptCount;i++) {
        var t=i/ptCount;
        var x=xStart+dx*t;
        var y=yStart+dy*t;
        var dx1=x-lastX;
        var dy1=y-lastY;
        if(dx1*dx1+dy1*dy1 > 0.999){
            coordX.push(x);
            coordY.push(y);
            lastX = x;
            lastY = y;
            tempX.push(x);
            tempY.push(y);
        }
    }
    coordX.push(xEnd);
    coordY.push(yEnd);
    
    tempX.push(xEnd);
    tempY.push(yEnd);
    //console.log("tempX " + tempX);
    //console.log("tempY " + tempY);
    //console.log(xStart + " " + yStart + " " + xEnd + " " + yEnd);
    //console.log(cnt);
}

function draw() {
    if (before) {
        ctx.strokeStyle = "black";
        ctx.beginPath();
        const xOffset = -640;
        const yOffset = -500;
        ctx.moveTo(before[0] + xOffset, before[1] + yOffset);
        ctx.lineTo(after[0] + xOffset, after[1] + yOffset);

        saveAllPointsBetween2Points(before[0] + xOffset, before[1] + yOffset, after[0] + xOffset, after[1] + yOffset);

        ctx.closePath();
        ctx.stroke();
        hasDrawn = true;
    }
    before = after;
    return true;
}

function processRightHandDrawing(frame) {
    if (isLeftHandOpenPalm || isSpaceBarPressed) {
        for (let i=0;i<frame.hands.length;i++) {
            if (frame.hands[i].type == "left") continue;
            var handPosition = frame.hands[i].screenPosition();
            var xOffset = 310;
            var yOffset = 310;
            var cursorPosition = [handPosition[0] - xOffset, handPosition[1] + yOffset];
            after = cursorPosition;
        }
        draw();
    }
}

function checkDrawingValidity(frame) {
    if (frame.hands.length >= 2) {
        var leftFrame = frame.hands[1], rightFrame = frame.hands[0];
        if (frame.hands[0].type == "left") {
            leftFrame = frame.hands[0];
            rightFrame = frame.hands[1];
        }
        isLeftHandDetected = true;
        warningDiv.innerHTML = "";

        // process left hand for drawing gesture
        if (leftFrame.grabStrength > 0.6) {
            isLeftHandOpenPalm = false;
            drawingCommandDiv.innerHTML = "end pen stroke";
            before = {};
        }
        else {
            isLeftHandOpenPalm = true;
            drawingCommandDiv.innerHTML = "start pen stroke";
        }

        processRightHandDrawing(frame);
    }
    else if (frame.hands.length == 1) {
        drawingCommandDiv.innerHTML = "";
        if (frame.hands[0].type == "left") {
            warningDiv.innerHTML = "No right hand detected";
            before = {};
        }
        else {
            isLeftHandDetected = false;
            warningDiv.innerHTML = "";
            if (!isSpaceBarPressed) {
                warningDiv.innerHTML = "end pen stroke";
                before = {};
            }
            else {
                warningDiv.innerHTML = "start pen stroke";
                processRightHandDrawing(frame);
            }
        }
    }
    else if (frame.hands.length == 0) { 
        drawingCommandDiv.innerHTML = "";
        isLeftHandDetected = false;
        warningDiv.innerHTML = "No hands detected";
        before = {};
    }
}

function processCursorOnRightHand(frame) {
    // cursor
    for (let i=0;i<frame.hands.length;i++) {
        if (frame.hands[i].type == "left") continue;
        var handPosition = frame.hands[i].screenPosition();
        var xOffset = 100;
        var yOffset = 300;
        var cursorPosition = [handPosition[0] - xOffset, handPosition[1] + yOffset];
        cursor.setScreenPosition(cursorPosition);
    }
}

Leap.loop(controllerOptions, function(frame, done) {
    after = [];
    processCursorOnRightHand(frame);
    checkDrawingValidity(frame);
}).use('screenPosition', {scale: LEAPSCALE});

// Add space bar handling
// space bar pressed: drawing
// space bar not press: end stroke
document.addEventListener('keydown', event => {
    if (event.code === 'Space') {
        isSpaceBarPressed = true;
    }
});

document.addEventListener('keyup', event => {
    if (event.code === 'Space') {
        const offset = 700.0;
        if (hasDrawn) { // Process 1 stroke
            var stroke = [];
            var newX = [];
            var newY = [];
            for (let i=0;i<coordX.length;i++) {
                newX.push(coordX[i] + offset);
                newY.push(coordY[i] + offset);
            }
            stroke.push(newX); stroke.push(newY);
            imageData.push(stroke);
        }
        coordX = [];
        coordY = [];
        hasDrawn = false;
        before = [];
        isSpaceBarPressed = false;
    }
});

/**
 * reference: https://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
 */
function clearCanvas() {
    // Store the current transformation matrix
    ctx.save();

    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Restore the transform
    ctx.restore();

    drawingDescDiv.innerHTML = "";
    before = [];
    imageData = [];
}

// ------------------------- process mouse ----------------------------------
var isMousePressed = false;

const mouseX = 440;
const mouseY = 90;
document.addEventListener('mousedown', event => {
    after = [event.offsetX + mouseX, event.offsetY + mouseY];
    draw();
    isMousePressed = true;
});

document.addEventListener('mousemove', event => {
    if (isMousePressed === true) {
        after = [event.offsetX + mouseX, event.offsetY + mouseY];
        draw();
    }
});

document.addEventListener('mouseup', event => {
    if (isMousePressed === true) {
        const offset = 700.0;
        if (hasDrawn) { // Process 1 stroke
            var stroke = [];
            var newX = [];
            var newY = [];
            for (let i=0;i<coordX.length;i++) {
                newX.push(coordX[i] + offset);
                newY.push(coordY[i] + offset);
            }
            stroke.push(newX); stroke.push(newY);
            imageData.push(stroke);
        }
        coordX = [];
        coordY = [];
        hasDrawn = false;
        after = [];
        before = [];
        isMousePressed = false;
    }
});

// ------------------------- process speech ---------------------------------
var processSpeech = function(transcript) {
    // Helper function to detect if any commands appear in a string
    var userSaid = function(str, commands) {
      for (var i = 0; i < commands.length; i++) {
        if (str.indexOf(commands[i]) > -1)
          return true;
      }
      return false;
    };

    var processed = false;
    if (userSaid('submit', transcript)) {
        submitDrawing();
        processed = true;
    }
    else if (userSaid('clear', transcript)) {
        clearCanvas();
        processed = true;
    }

    return processed;
}

// ------------------------- machine learning parts -------------------------
const SIZE = 128;

tf.loadLayersModel('./model/mobilenet/model.json').then(function(model) {
    window.model = model;
});

function submitDrawing() {
    // Scale value to 0 - SIZE
    var minValue = Number.MAX_SAFE_INTEGER;
    var maxValue = 0;
    for (let i=0;i<imageData.length;i++) { // find min and max value
        minValue = Math.min(minValue, Math.min.apply(Math, imageData[i][0]));
        minValue = Math.min(minValue, Math.min.apply(Math, imageData[i][1]));
        maxValue = Math.max(maxValue, Math.max.apply(Math, imageData[i][0]));
        maxValue = Math.max(maxValue, Math.max.apply(Math, imageData[i][1]));
    }
    //console.log(minValue + " " + maxValue);
    // scale values
    for (let i=0;i<imageData.length;i++) { // stroke
        for (let j=0;j<imageData[i].length;j++) {
            for (let k=0;k<imageData[i][j].length;k++) {
                let curVal = imageData[i][j][k];
                let newVal = (curVal - minValue) * SIZE / (maxValue - minValue);
                imageData[i][j][k] = Math.min(SIZE-1, Math.max(0, Math.round(newVal)));
            }
        }
    }
    // Remove duplicate consecutive value (same [x, y])
    for (let i=0;i<imageData.length;i++) {
        const newX = [imageData[i][0][0]];
        const newY = [imageData[i][1][0]];
        for (let j=1;j<imageData[i][0].length;j++) {
            if (imageData[i][0][j] === imageData[i][0][j-1] && imageData[i][1][j] === imageData[i][1][j-1]) {
                continue;
            }
            newX.push(imageData[i][0][j]);
            newY.push(imageData[i][1][j]);
        }
        imageData[i][0] = newX;
        imageData[i][1] = newY;
        
        /*console.log("stroke " + i);
        for (let j=0;j<imageData[i][0].length;j++) {
            console.log(imageData[i][0][j] + " " + imageData[i][1][j]);
        }*/
    }

    // change image encoding: https://www.kaggle.com/echomil/mobilenet-126x126x3-100k-per-class
    var encodedImg = [];
    for (let i=0;i<SIZE;i++) { //initialize to 0
        let temp1 = [];
        for (let j=0;j<SIZE;j++) {
            let temp = []
            for (let k=0;k<3;k++) temp.push(0);
            temp1.push(temp);
        }
        encodedImg.push(temp1);
    }
    for (let t=0;t<imageData.length;t++) {
        let stroke = imageData[t];
        let points_count = stroke[0].length - 1;
        let grad = Math.floor(255 / points_count);
        for (let i=0;i<stroke[0].length-1;i++) {
            encodedImg[stroke[0][i]][stroke[1][i]][0] = 255/255.0;
            encodedImg[stroke[0][i]][stroke[1][i]][1] = (255 - Math.min(t, 10)*13)/255.0;
            encodedImg[stroke[0][i]][stroke[1][i]][2] = (Math.max(255 - grad * i, 20))/255.0;
        }
    }

    predict(encodedImg);
}

var predict = function(input) {
    if (window.model) {
      window.model.predict([tf.tensor(input).reshape([1, SIZE, SIZE, 3])]).array().then(function(scores){
        scores = scores[0];
        predicted = scores.indexOf(Math.max(...scores));
        
        drawingDescDiv.innerText = "There is a " + categories[predicted];
      });
    } else {
      // The model takes a bit to load, if we are too fast, wait
      setTimeout(function(){predict(input)}, 50);
    }
}