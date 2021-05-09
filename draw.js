var cursor = new Cursor();
var LEAPSCALE = 0.6;
setupUserInterface();

// Adapted from https://developer-archive.leapmotion.com/leapjs/examples/draw.html
// Setup Leap loop with frame callback function
var controllerOptions = { enableGestures: true },
    width = 800,
    height = 400,
    canvas = d3.select('#canvas-body')
        .append('canvas')
        .attr('width', width)
        .attr('height', height)
        .attr("style", "outline: thin solid black;").node(),
    ctx = canvas.getContext('2d'),
    before = {},
    after = {};

ctx.lineWidth = 5;
ctx.translate(width/2, height/2 + 210);

var isLeftHandDetected = false;
var isLeftHandOpenPalm = false;
var isSpaceBarPressed = false;

var warningDiv = document.getElementById("leap-warning");
var drawingCommandDiv = document.getElementById("drawing-command");
var drawingDescDiv = document.getElementById("doodle-description");

function draw() {
    if (before) {
        ctx.strokeStyle = "black";
        ctx.beginPath();
        const xOffset = -640;
        const yOffset = -500;
        ctx.moveTo(before[0] + xOffset, before[1] + yOffset);
        ctx.lineTo(after[0] + xOffset, after[1] + yOffset);
        ctx.closePath();
        ctx.stroke();
    }
    before = after;
    return true;
}

function processRightHandDrawing(frame) {
    if (isLeftHandOpenPalm || isSpaceBarPressed) {
        for (let i=0;i<frame.hands.length;i++) {
            if (frame.hands[i].type == "left") continue;
            var handPosition = frame.hands[i].screenPosition();
            var xOffset = 100;
            var yOffset = 300;
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
    after = {};
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
        before = {};
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
    before = {};
}

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
tf.loadLayersModel('./model/mobilenet/model.json').then(function(model) {
    window.model = model;
});

function submitDrawing() {
    drawingDescDiv.innerHTML = "There is a flower on the canvas.";
}