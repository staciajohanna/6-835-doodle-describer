var cursor = new Cursor();
var LEAPSCALE = 0.6;
setupCursorInterface();

var controllerOptions = { enableGestures: true };

let spaceDetect = document.getElementById("space-tutorial-detect");
let rightHandDetect = document.getElementById("right-tutorial-detect");

function checkHandStatus(frame) {
    if (frame.hands.length >= 2) {
        rightHandDetect.innerHTML = "Yes";
    }
    else if (frame.hands.length == 1) {
        if (frame.hands[0].type == "left") {
            rightHandDetect.innerHTML = "No";
        }
        else {
            rightHandDetect.innerHTML = "Yes";
        }
    }
    else if (frame.hands.length == 0) { 
        rightHandDetect.innerHTML = "No";
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
    processCursorOnRightHand(frame);
    checkHandStatus(frame);
}).use('screenPosition', {scale: LEAPSCALE});

document.addEventListener('keydown', event => {
    if (event.code === 'Space') {
        spaceDetect.innerHTML = "Yes";
    }
});

document.addEventListener('keyup', event => {
    if (event.code === 'Space') {
        spaceDetect.innerHTML = "No";
    }
});