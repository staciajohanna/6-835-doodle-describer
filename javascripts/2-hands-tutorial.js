var cursor = new Cursor();
var LEAPSCALE = 0.6;
setupCursorInterface();

var controllerOptions = { enableGestures: true };

let leftHandDetect = document.getElementById("left-tutorial-detect");
let leftHandGesture = document.getElementById("left-tutorial-gesture");
let rightHandDetect = document.getElementById("right-tutorial-detect");

function checkHandStatus(frame) {
    if (frame.hands.length >= 2) {
        var leftFrame = frame.hands[1], rightFrame = frame.hands[0];
        if (frame.hands[0].type == "left") {
            leftFrame = frame.hands[0];
            rightFrame = frame.hands[1];
        }
        rightHandDetect.innerHTML = "Yes";
        leftHandDetect.innerHTML = "Yes";

        // process left hand for drawing gesture
        if (leftFrame.grabStrength > 0.6) {
            leftHandGesture.innerHTML = "Close Fist";
        }
        else {
            leftHandGesture.innerHTML = "Open Palm";
        }
    }
    else if (frame.hands.length == 1) {
        if (frame.hands[0].type == "left") {
            leftHandDetect.innerHTML = "Yes";
            rightHandDetect.innerHTML = "No";
            if (frame.hands[0].grabStrength > 0.6) {
                leftHandGesture.innerHTML = "Close Fist";
            }
            else {
                leftHandGesture.innerHTML = "Open Palm";
            }
        }
        else {
            leftHandDetect.innerHTML = "No";
            leftHandGesture.innerHTML = "N/A";
            rightHandDetect.innerHTML = "Yes";
        }
    }
    else if (frame.hands.length == 0) { 
        leftHandDetect.innerHTML = "No";
        leftHandGesture.innerHTML = "N/A";
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