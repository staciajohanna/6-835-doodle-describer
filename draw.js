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
    var a, b;

    for (var id in after) {
        b = before[id],
        a = after[id];
        if (!b) continue;

        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(b.tipPosition[0], -b.tipPosition[1]);
        ctx.lineTo(a.tipPosition[0], -a.tipPosition[1]);
        ctx.closePath();
        ctx.stroke();
    }
    before = after;
    return true;
}

// referenced from : https://developer-archive.leapmotion.com/documentation/javascript/api/Leap.Hand.html#Hand
/*function handStateFromHistory(hand, historySamples) {
    if(hand.grabStrength == 1) return "closed";
    else if (hand.grabStrength == 0) return "open";
    else {
        var sum = 0
        for(var s = 0; s < historySamples; s++){
            var oldHand = controller.frame(s).hand(hand.id)
            if(!oldHand.valid) break;
            sum += oldHand.grabStrength
        }
        var avg = sum/s;
        if(hand.grabStrength - avg < 0) return "opening";
        else if (hand.grabStrength > 0) return "closing";
    }
    return"not detected";
}*/

function processRightHandDrawing(frame) {
    var rightHandPointables = [];
    for (var i = 0; i < frame.pointables.length; i++) {
        // get hand info
        var curHand = frame.pointables[i].hand();
        if (curHand.type == "right") {
            rightHandPointables.push(frame.pointables[i]);
        }
    }

    if (isLeftHandOpenPalm || isSpaceBarPressed) {
        // process right hand for drawing
        for (var i = 0; i < Math.min(1, rightHandPointables.length); i++) {
            after[rightHandPointables[i].id] = rightHandPointables[i];
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

Leap.loop(controllerOptions, function(frame, done) {
    after = {};
    checkDrawingValidity(frame);
});

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

function submitDrawing() {
    drawingDescDiv.innerHTML = "There is [description] in the drawing.";
}