// Adapted from https://developer-archive.leapmotion.com/leapjs/examples/draw.html
// Setup Leap loop with frame callback function
var controllerOptions = { enableGestures: true },
    width = 1200,
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
ctx.translate(width/2, height/2);

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
    for (var i = 0; i < Math.min(1, frame.pointables.length); i++) {
        after[frame.pointables[i].id] = frame.pointables[i];
    }
    draw();
    //done();
});