
var rect = new Rectangle(50, 50, 64, 64);
rect.style.fillStyle = "rgb(150, 0, 100)";
rect.style.strokeStyle = "#FFFFFF";
rect.events.draggable = true; // make rect draggable

/* runs once */
function start() {
    lib.initialize.mouse(); // initialize mouse events.
    lib.initialize.touch(); // initialize touch events.
}

/* loop */
function update() {
    rect.rotation.degree += 0.25;
}

/* loop */
function render() {
    clearCanvas();
    rect.render(); // render rect object
}