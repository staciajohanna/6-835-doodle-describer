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
var isLeftHandFistGesture = false;

var warningDiv = document.getElementById("leap-warning");

function draw() {
    var a, b;

    for (var id in after) {
        b = before[id],
        a = after[id];
        if (!b) continue;

        ctx.strokeStyle = "black";
        ctx.moveTo(b.tipPosition[0], -b.tipPosition[1]);
        ctx.lineTo(a.tipPosition[0], -a.tipPosition[1]);
        ctx.stroke();
        ctx.beginPath();
    }

    before = after;
    return true;
}

Leap.loop(controllerOptions, function(frame, done) {
    after = {};
    if (frame.hands.length >= 2) {
        var leftFrame = frame.hands[1], rightFrame = frame.hands[0];
        if (frame.hands[0].type == "left") {
            leftFrame = frame.hands[0];
            rightFrame = frame.hands[1];
        }
        isLeftHandDetected = true;
        warningDiv.innerHTML = "";

        // Get pointables of each hand
        var rightHandPointables = [];
        var leftHandPointables = [];
        for (var i = 0; i < frame.pointables.length; i++) {
            // get hand info
            var curHand = frame.pointables[i].hand();
            if (curHand.type == "right") {
                rightHandPointables.push(frame.pointables[i]);
            }
            else {
                leftHandPointables.push(frame.pointables[i]);
            }
        }

        for (var i = 0; i < Math.min(1, rightHandPointables.length); i++) {
            after[rightHandPointables[i].id] = rightHandPointables[i];
        }
        draw();
    }
    else if (frame.hands.length == 1) {
        if (frame.hands[0].type == "left") {
            warningDiv.innerHTML = "No right hand detected";
        }
        else {
            isLeftHandDetected = false;
            warningDiv.innerHTML = "No left hand detected";
        }
    }
    else if (frame.hands.length == 0) {
        isLeftHandDetected = false;
        warningDiv.innerHTML = "No hands detected";
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
}