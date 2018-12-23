
//============================================
const FullScreen = true;
//============================================
const normalWidth = 980;  // #480
const normalHeight = 640; // #270
const fullscreenWidth = screen.width;  // #640
const fullscreenHeight = screen.height;// #360
//============================================

//============================================

const width = FullScreen ? fullscreenWidth : normalWidth;
const height = FullScreen ? fullscreenHeight : normalHeight;

//============================================

var canvas = document.getElementsByTagName("canvas")[0];
var ctx = canvas.getContext("2d");

//============================================

const PR = devicePixelRatio;
const Degrees = Math.PI / 180;

//============================================

canvas.width = width * PR;
canvas.height = height * PR;
canvas.style.width = (FullScreen ? fullscreenWidth : normalWidth) + "px";
canvas.style.height = (FullScreen ? fullscreenHeight : normalHeight) + "px";


//============================================

var FPS = 0;
var FrameTime = 0;
var FrameLatency = 0;
var FrameDelay = 0;

//============================================

var defualtFontSize = 18;
var defaultFontFamily = "Consolas, Segoe UI, Tahoma, Arial";
ctx.textBaseline = "hanging"; /* Do not change this! for accurate measurements. */
ctx.font = defualtFontSize + "px " + defaultFontFamily;
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

//============================================

const runFunction = f => { if (typeof f === "function") f(); };
const applyFunction = (f, a) => { if (typeof f === "function" && a !== null) f.apply(a); };
const clearCanvas = () => { ctx.clearRect(0, 0, width * PR, height * PR); };
const fillCanvas = (r = 255, g = 255, b = 255, a = 1) => {
    _VALUE_.set("fillStyle", "rgba(" + r + "," + g + "," + b + "," + a + ")");
    ctx.fillRect(0, 0, width * PR, height * PR);
    _VALUE_.reset("fillStyle");
};

//============================================

class Position {
    constructor(x = 0, y = 0) {
        this.coordinates = new Float64Array(2);
        this.coordinates[0] = x;
        this.coordinates[1] = y;
        this.z = -1;
    }
    set(x = 0, y = 0) { this.coordinates[0] = x; this.coordinates[1] = y; }
    add(x = 0, y = 0) { this.coordinates[0] += x; this.coordinates[1] += y; }
    copy(position) { this.set(position.x, position.y); }
    compare(position) { return this.x === position.x && this.y === position.y; }
    get x() { return this.coordinates[0]; }
    get y() { return this.coordinates[1]; }
    set x(x) { this.coordinates[0] = x; }
    set y(y) { this.coordinates[1] = y; }
    get text() { return this.x + "px, " + this.y + "px"; }
}

class Dimension {
    constructor(width = 64, height = 64) {
        this.dimensions = new Float64Array(2);
        this.dimensions[0] = width;
        this.dimensions[1] = height;
    }
    set(width = 0, height = 0) { this.dimensions[0] = width; this.dimensions[1] = height; }
    add(width = 0, height = 0) { this.dimensions[0] += width; this.dimensions[1] += height; }
    copy(dimension) { this.set(dimension.width, dimension.height); }
    compare(dimension) { return this.width === dimension.width && this.height === dimension.height; }
    get width() { return this.dimensions[0]; }
    get height() { return this.dimensions[1]; }
    set width(width) { this.dimensions[0] = width; }
    set height(height) { this.dimensions[1] = height; }
}

class Rotation {
    constructor() {
        this.degree = 0;
        this.isRotating = false;
    }
}

class ObjectEvents {
    constructor() {
        //==========================
        this.values = {
            down: false,
            up: false,
            out: true,
            x: 0, y: 0
        };
        //==========================
        this.draggable = false;
        //==========================
        this.onClick = null;
        this.onMouseDown = null;
        this.onMouseMove = null;
        this.onMouseUp = null;
        this.onMouseOver = null;
        this.onMouseOut = null;
        this.onDoubleClick = null;
        //==========================
        this.onTouch = null;
        this.onTouchDown = null;
        this.onTouchMove = null;
        this.onTouchUp = null;
        this.onDoubleTouch = null;
        this.onTouchOut = null;     //!
        this.whileTouchDown = null;
        this.whileTouchOut = null;
        this.whileTouching = null;
        this.whileTouchIn = null;
        //==========================
    }
}

//============================================

class DrawingBase {
    constructor(x = 0, y = 0) {
        this.id = _OBJECT_.id++;
        this.position = new Position(x, y);
        this.rotation = new Rotation();
        this.events = new ObjectEvents();
        this.pointer = null;
    }
    update() { }
    render() { }
    _draw_() { }
}

class DrawingShape extends DrawingBase {
    constructor(x = 0, y = 0, width = 64, height = 64) {
        super(x, y);
        this.dimensions = new Dimension(width, height);
    }
    render() {
        ctx.beginPath();
        _DRAWING_.start(this);
    }
}

class DrawingText extends DrawingBase {
    constructor(x = 0, y = 0) {
        super(x, y);
        this.dimensions = new Dimension(0, 0);
    }
    render() {
        _DRAWING_.start(this);
    }
}

class DrawingImage extends DrawingBase {
    constructor(x = 0, y = 0) {
        super(x, y);
        this.dimensions = new Dimension(0, 0);
    }
    render() {
        _DRAWING_.start(this);
    }
}

//============================================

class StyleBase {
    constructor() {
        this.alpha = 1;
        this.shadowColor = "#000";
        this.shadowBlur = 0;
        this.shadowX = 0;
        this.shadowY = 0;
    }
}

class ShapeStyle extends StyleBase {
    constructor() {
        super();
        this.fillStyle = "#AAA";
        this.strokeStyle = "#000";
        this.lineWidth = 1;
    }
}

class TextStyle extends StyleBase {
    constructor(target = null) {
        super();
        this.target = target;
        this.fillStyle = "#AAA";
        this.textAlign = "left";
        this.ff = defaultFontFamily;
        this.fs = defualtFontSize;
        this.lh = 0;
    }
    get fontFamily() { return this.ff; }
    get fontSize() { return this.fs; }
    get lineHeight() { return this.lh; }
    set fontFamily(x) { this.ff = x; _OBJECT_.setTextDim(this.target); }
    set fontSize(x) { this.fs = x; _OBJECT_.setTextDim(this.target); }
    set lineHeight(x) { this.lh = x; _OBJECT_.setTextDim(this.target); }
}

//============================================

class Rectangle extends DrawingShape {
    constructor(x = 0, y = 0, width = 64, height = 64) {
        super(x, y, width, height);
        this.style = new ShapeStyle();
    }
    _draw_() {
        if (this.style.fillStyle !== "")
            ctx.fillRect(this.position.x * PR, this.position.y * PR, this.dimensions.width * PR, this.dimensions.height * PR);
        if (this.style.lineWidth > 0 && this.style.strokeStyle !== "") {
            ctx.strokeRect(this.position.x * PR, this.position.y * PR, this.dimensions.width * PR, this.dimensions.height * PR);
            ctx.stroke();
        }
    }
}

class RichText extends DrawingText {
    constructor(text = "blank text", x = 0, y = 0) {
        super(x, y);
        this.style = new TextStyle(this);
        this.content = [];
        this.lines = 1;
        this.text = text;
        this.plainText = "";
    }
    _draw_() {
        var x = 0, c = this.style.textAlign.toLowerCase();
        if (c === "center") x = this.dimensions.width / 2;
        else if (c === "right") x = this.dimensions.width;
        if (this.style.fillStyle === "") return;
        for (var i = 0; i < this.lines; i++) ctx.fillText(this.content[i], (this.position.x + x) * PR, (this.position.y + (this.style.fontSize + this.style.lineHeight) * i) * PR);
    }
    set text(text) { _OBJECT_.setText(this, text); }
    get text() { return this.plainText; }
}

class Picture extends DrawingImage {
    constructor(src = "x.png", x = 0, y = 0, width = -1, height = -1) {
        super(x, y);
        this.style = new StyleBase();
        this.image = lib.load.image(src);
        this.image.onload = () => { this.dimensions.set(width === -1 ? this.image.width : width, height === -1 ? this.image.height : height); };
    }
    _draw_() {
        ctx.drawImage(this.image, this.position.x * PR, this.position.y * PR, this.dimensions.width * PR, this.dimensions.height * PR);
    }
}








//============================================

class TouchPointer {
    constructor(id = -1) {
        this.id = id;
        this.type = 0;
        this.target = null;
        this.upTime = 0;
        this.position = new Position(NaN, NaN);
        this.downPosition = new Position(NaN, NaN);
        this.prevPosition = new Position(NaN, NaN);
        this.dimensions = new Dimension(16, 16);
    }
    assign(type = 0, x = 0, y = 0, target = null) {
        this.target = target;
        this.upTime = 0;
        this.type = type;
        this.prevPosition.copy(this.position);
        this.position.set(x, y);
    }
    update() {
        _UPDATE_POINTER_(this);
    }
    updateWhile() {
        _UPDATE_WHILE_(this);
    }
}

class TouchPointers {
    constructor(length = 10) {
        this.pointers = [];
        for (let i = 0; i < length; i++) this.pointers[i] = new TouchPointer(i);
    }
    start() {
        var p = this.pointers;
        for (var i = 0; i < p.length; i++) {
            if (p[i].type !== 1) continue;
            p[i].update();
        }
    }
    move() {
        var p = this.pointers;
        for (var i = 0; i < p.length; i++) {
            if (p[i].type !== 2) continue;
            p[i].update();
        }
    }
    end() {
        var p = this.pointers;
        for (var i = 0; i < p.length; i++) {
            if (p[i].type !== 3) continue;
            p[i].update();
        }
    }
    findObject(pointer) {
        var r = null, p = _OBJECT_.rendered, i = p.length - 1;
        for (; i > -1 && r === null; i--)
            if (_OBJECT_.collision(p[i], pointer)) r = p[i];
        return r;
    }
    updateWhile() {
        var p = _TOUCH_.pointers;
        for (var i = 0; i < p.length; i++)
            p[i].updateWhile();
        _OBJECT_.z = 0;
    }
}

const _UPDATE_POINTER_ = pointer => {
    if (pointer.target === null) return;
    var pp = pointer.position, pt = pointer.target, e = pt.events, t = pointer.type, v = e.values;
    if (t === 1) {
        if (!v.down) {
            runFunction(e.onTouchDown);
            pointer.downPosition.copy(pp);
            v.down = true;
        } else {
            runFunction(e.onDoubleTouch);
            pointer.upTime = 0;
            v.down = false;
        }
        _OBJECT_.drag.save(e, pointer);
    } else if (t === 2) {
        if (_OBJECT_.collision(pointer, pt)) v.out = false;
        else if (!v.out) runFunction(e.onTouchOut), v.out = true;
    } else if (t === 3) {
        runFunction(e.onTouchUp);
        if (pp.compare(pointer.downPosition)) runFunction(e.onTouch);
    }
};

const _UPDATE_WHILE_ = pointer => {
    var t = pointer.type;
    if (pointer.target === null) {
        if (t === 1 || t === 2) {
            var c = _TOUCH_.findObject(pointer);
            if (c === null) return;
            runFunction(c.events.whileTouchIn);
        }
        return;
    }
    var pp = pointer.position, pt = pointer.target, e = pt.events, cl = _OBJECT_.collision(pointer, pt), v = e.values;
    if (t === 1) {
        if (cl) {
            runFunction(e.whileTouching);
            if (pp.compare(pointer.downPosition)) runFunction(e.whileTouchDown);
        } else {
            runFunction(e.whileTouchOut);
            if (e.draggable) _OBJECT_.drag.start(e, pointer);
        }
    } else if (t === 2) {
        if (cl) {
            runFunction(e.whileTouching);
            if (!pp.compare(pointer.prevPosition)) {
                runFunction(e.onTouchMove);
                pointer.prevPosition.copy(pp);
                if (e.draggable) _OBJECT_.drag.start(e, pointer);
            }
        } else {
            runFunction(e.whileTouchOut);
            if (e.draggable) _OBJECT_.drag.start(e, pointer);
        }
    }
    if (pointer.upTime > 400) v.down = false, pointer.upTime = 0;
    else pointer.upTime += FrameLatency;
};

//============================================

const _START_ENGINE_ = () => {
    //--------------------
    if (_VALUE_.saved["EngineStarted"]) return;
    _VALUE_.set("EngineStarted", true);
    //--------------------
    if (typeof start === "function") start();
    //--------------------
    if (typeof update !== "function") return;
    //--------------------
    if (typeof render !== "function") return;
    //--------------------
    let obj_upd = _OBJECT_.updates;
    let engine_updates = () => {
        if (obj_upd.timeManager !== null) runFunction(obj_upd.timeManager._update_);
        if (_TOUCH_ !== null) runFunction(_TOUCH_.updateWhile);
        _UPDATE_VIEWPORT_();
    };
    //--------------------
    (function loop(t) {
        FrameLatency = t - FrameTime;
        FrameTime = t;
        update();
        render();
        engine_updates();
        FrameDelay = performance.now() - t;
        FPS = Math.round(1000 / FrameLatency);
        requestAnimationFrame(loop);
    })(1000 / 60);
};
document.addEventListener("deviceReady", _START_ENGINE_.bind(this), false);
window.addEventListener("load", _START_ENGINE_.bind(this), false);

//============================================

var _TOUCH_ = null;
{
    let $ = (e, ref, type, func) => {
        if (_TOUCH_ === null) return;
        var p = null, t = e[ref], r = canvas.getBoundingClientRect();
        for (var i = 0; i < t.length; i++) {
            p = _TOUCH_.pointers[t[i].identifier];
            p.assign(type, t[i].pageX - r.left - 4 * PR, t[i].pageY - r.top - 4 * PR, p.target);
            if (type !== 2) p.target = _TOUCH_.findObject(p);
        }
        _TOUCH_[func]();
    };
    canvas.addEventListener("touchstart", e => { $(e, "touches", 1, "start"); });
    canvas.addEventListener("touchmove", e => { $(e, "touches", 2, "move"); });
    canvas.addEventListener("touchend", e => { $(e, "changedTouches", 3, "end"); });
}

{
    let initialized = false;
    //========================================
    let target = null, ptarget = null, mtarget = null;
    let position = new Position(0, 0), prevPosition = new Position(0, 0), downPosition = new Position(0, 0);
    let mouse = { position: position, dimensions: new Dimension(1, 1), get target() { return target; } };
    let rect = canvas.getBoundingClientRect();
    //========================================
    let init = () => {
        if (initialized) return; else initialized = true;
        rect = canvas.getBoundingClientRect();
        canvas.onmousedown = e => { e.preventDefault(); return false; };
        canvas.addEventListener("mousedown", e => { handleEvent(e.pageX, e.pageY, 0); });
        canvas.addEventListener("mousemove", e => { handleEvent(e.pageX, e.pageY, 1); });
        canvas.addEventListener("mouseup", e => { handleEvent(e.pageX, e.pageY, 2); });
        canvas.addEventListener("dblclick", e => { handleEvent(e.pageX, e.pageY, 3); });
    };
    //========================================
    let getObject = () => {
        var r = null, p = _OBJECT_.rendered, i = p.length - 1;
        for (; i > -1 && r === null; i--)
            if (_OBJECT_.collision(p[i], mouse)) r = p[i];
        return r;
    };
    //========================================
    let handleEvent = (x = 0, y = 0, t = 0) => {
        prevPosition.copy(position);
        position.set(x - rect.left, y - rect.top);
        if (t === 0) downPosition.copy(position);
        if (t === 1) {
            mtarget = getObject();
            if (target !== null && target.events.draggable) _OBJECT_.drag.start(target.events, mouse);
        } else target = getObject();
        //====================================
        var n = t === 1 ? mtarget : target;
        if (n !== null) executeEvent[t](n);
        //====================================
        if (ptarget !== null && ptarget !== n && !ptarget.events.values.out && t === 1) {
            applyFunction(ptarget.events.onMouseOut, ptarget);
            ptarget.events.values.out = true;
            ptarget = null;
        }
        ptarget = n;
    };
    //========================================
    var Mouse = {
        init() { init(); },
        get x() { return position.x; },
        get y() { return position.y; }
    };
    //========================================
    let executeEvent = [
        t => { // MouseDown
            var e = t.events;
            applyFunction(e.onMouseDown, t);
            e.values.up = !(e.values.down = true);
            _OBJECT_.drag.save(e, mouse);
        },
        t => { // MouseMove
            var e = t.events;
            applyFunction(e.onMouseMove, t);
            if (e.values.out) applyFunction(e.onMouseOver, t), e.values.out = false;
        },
        t => { // MouseUp
            var e = t.events, v = e.values;
            if (v.down && position.compare(downPosition)) applyFunction(e.onClick, t);
            applyFunction(e.onMouseUp, t);
            v.up = !(v.down = false);
            target = null;
        },
        t => { // DoubleClick
            applyFunction(t.events.onDoubleClick, t);
            target = null;
        }
    ];
    //========================================
}

{
    var keyboard = {
        get initialized() { return initialized; },
        init() { init(); },
        onKeyPress(keyCode, func) { onKeyPress(keyCode, func); },
        onKeyDown(keyCode, func) { if (keys[keyCode]) runFunction(func); }
    };
    //========================================
    let initialized = false;
    let keys = {}, mutex = {};
    //========================================
    let init = () => {
        if (initialized) return;
        initialized = true;
        window.addEventListener("keydown", e => { keys[e.keyCode] = true; });
        window.addEventListener("keyup", e => { keys[e.keyCode] = false; mutex[e.keyCode] = false; });
    };
    //========================================
    let onKeyPress = (keyCode, func) => {
        if (mutex[keyCode]) return;
        if (keys[keyCode]) {
            mutex[keyCode] = true;
            runFunction(func);
        }
    };
}

{
    var viewport = {
        get x() { return x; },
        get y() { return y; },
        get enableFloatingPoint() { return enableFloatingPoint; },
        get enableEndRounding() { return enableEndRounding; },
        get following() { return following; },
        set enableFloatingPoint(state) { enableFloatingPoint = state; },
        set enableEndRounding(state) { enableEndRounding = state; },
        set following(obj) { following = obj; }
    };
    //========================================
    let x = 0, y = 0, speed = 3;
    let velocity = 0, vIncrement = 0.0125;
    let enableFloatingPoint = false, enableEndRounding = true;
    let following = null;
    //========================================
    var _UPDATE_VIEWPORT_ = () => {
        if (following === null) return;
        let ax = x + width / 2 - following.position.x;
        let ay = y + height / 2 - following.position.y;
        let z = Math.sqrt(ax * ax + ay * ay) / speed * velocity;

        velocity = lib.max(velocity + vIncrement, 1);

        if (z < 0.5) {
            velocity = vIncrement;
            x = enableEndRounding ? Math.round(x) : x;
            y = enableEndRounding ? Math.round(y) : y;
            return;
        }

        let vx = ax / z;
        let vy = ay / z;

        let fx = Math.abs(vx) > z ? vx < 0 ? -z : z : vx;
        let fy = Math.abs(vy) > z ? vy < 0 ? -z : z : vy;

        x -= enableFloatingPoint ? fx : Math.floor(fx);
        y -= enableFloatingPoint ? fy : Math.floor(fy);
    };
}
//============================================

class TimeManager {
    constructor() {
        this.timers = {};
        this.names = [];
        this.length = 0;
        _OBJECT_.updates.timeManager = this;
    }
    setTimer(name = "timer", msDuration = 3000, repeat = false, onFinish = null) {
        if (this.timers[name]) return;
        this.names[this.length] = name;
        this.timers[name] = {
            index: this.length++,
            time: 0,
            duration: msDuration,
            paused: false,
            repeat: repeat,
            onFinish: onFinish
        };
    }
    pauseTimer(name = "timer") { this.timers[name].paused = true; }
    resumeTimer(name = "timer") { this.timers[name].paused = false; }
    deleteTimer(name = "timer") {
        this.names[this.timers[name].index] = null;
        delete this.timers[name];
    }
    _update_() {
        var n = _OBJECT_.updates.timeManager.names, t = _OBJECT_.updates.timeManager.timers, c = null;
        for (var i = 0; i < n.length; i++) {
            if (n[i] === null) continue;
            c = t[n[i]];
            if (c.paused) continue;
            c.time += FrameLatency;
            if (c.time >= c.duration) {
                runFunction(c.onFinish);
                if (c.repeat) c.time = 0;
                else c.paused = true;
            }
        }
    }
}

class counter {
    constructor(value = 0, min = 0, max = 1, delta = 0.1) {
        this.interval = new interval(value, min, max, delta);
        this.down = false;
    }
    get value() { return this.interval.value; }
    update() {
        if (!this.down && this.interval.isMax) this.down = true;
        else if (this.down && this.interval.isMin) this.down = false;
        if (this.down) this.interval.decrease();
        else this.interval.increase();
    }
}

class interval {
    constructor(value = 0, min = 0, max = 1, delta = 0.1) {
        this.value = value;
        this.min = min;
        this.max = max;
        this.delta = delta;
    }
    increase() {
        if (this.value === this.max) return;
        if (this.value + this.delta > this.max) this.value = this.max;
        else this.value += this.delta;
    }
    decrease() {
        if (this.value === this.min) return;
        if (this.value - this.delta < this.min) this.value = this.min;
        else this.value -= this.delta;
    }
    get isMax() { return this.value === this.max; }
    get isMin() { return this.value === this.min; }
}

//============================================

const lib = {
    initialize: {
        touch: (length = 10) => {
            _TOUCH_ = new TouchPointers(length);
        },
        mouse: () => {
            Mouse.init();
        }
    },
    write: (msg = "", x = 0, y = 0) => {
        _VALUE_.set("font", defualtFontSize * PR + "px Consolas,Arial")("fillStyle", "#999");
        ctx.fillText(String(msg), x * PR, y * PR);
        _VALUE_.reset("font")("fillStyle");
    },
    min: (value = 1, min = 0) => {
        return value < min ? min : value;
    },
    max: (value = 0, max = 1) => {
        return value > max ? max : value;
    },
    random: (min = 0, max = 1) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    load: {
        audio: (src = "x.wav") => {
            var e = new Audio(src);
            return e;
        },
        image: (src = "x.png", width = -1, height = -1) => {
            var e = new Image();
            if (width !== -1) e.width = width;
            if (height !== -1) e.height = height;
            e.src = src;
            return e;
        }
    },
    getTime: (seconds = 0) => {
        var t = Math.floor(FrameTime / 1000);
        var h = Math.floor(t / 3600);
        var m = Math.floor(t / 60) % 60;
        var s = t % 60;
        return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    }
};

//============================================

const _VALUE_ = {
    saved: {},
    set: (name = "", value = "") => {
        if (value !== ctx[name]) {
            _VALUE_.saved[name] = ctx[name];
            ctx[name] = value;
        }
        return _VALUE_.set;
    },
    reset: (name = "") => {
        if (ctx[name] !== _VALUE_.saved[name])
            ctx[name] = _VALUE_.saved[name];
        return _VALUE_.reset;
    }
};

//============================================

const _OBJECT_ = {
    z: 0,
    id: 0,
    rendered: [],
    updates: {
        timeManager: null
    },
    drag: {
        save: (events, pointer) => {
            events.values.x = pointer.position.x - pointer.target.position.x;
            events.values.y = pointer.position.y - pointer.target.position.y;
        },
        start: (events, pointer) => {
            pointer.target.position.copy(pointer.position);
            pointer.target.position.add(-events.values.x, -events.values.y);
        }
    },
    collision: (a, b, x = 0, y = 0) => {
        if (a.position.x + x <= b.position.x && a.position.x + a.dimensions.width + x >= b.position.x || a.position.x + x >= b.position.x && a.position.x + x <= b.position.x + b.dimensions.width || a.position.x + x >= b.position.x && a.position.x + x <= b.position.x + b.dimensions.width)
            if (a.position.y + y <= b.position.y && a.position.y + a.dimensions.height + y >= b.position.y || a.position.y + y >= b.position.y && a.position.y + y <= b.position.y + b.dimensions.height || a.position.y + y >= b.position.y && a.position.y + y <= b.position.y + b.dimensions.height)
                return true;
        return false;
    },
    setText: (obj, text) => {
        var t = String(text);
        if (t === obj.plainText) return;
        var s = t.split("\n");
        obj.plainText = t;
        obj.lines = s.length;
        _OBJECT_.setTextDim(obj);
    },
    setTextDim: obj => {
        var s = obj.plainText.split("\n"), f = ctx.font, w = 0;
        ctx.font = obj.style.fontSize + "px " + obj.style.fontFamily;
        for (var i = 0; i < obj.lines; i++) obj.content[i] = s[i], w = Math.max(w, ctx.measureText(s[i]).width);
        ctx.font = f;
        obj.dimensions.set(w, obj.lines * (obj.style.fontSize + obj.style.lineHeight));
    }
};

//============================================

const _DRAWING_ = {
    set: obj => {
        _OBJECT_.rendered[_OBJECT_.z++] = obj;
        _VALUE_.set("globalAlpha", obj.style.alpha)("shadowColor", obj.style.shadowColor)("shadowBlur", obj.style.shadowBlur)("shadowOffsetX", obj.style.shadowX)("shadowOffsetY", obj.style.shadowY);
        if (obj instanceof DrawingShape)
            _VALUE_.set("fillStyle", obj.style.fillStyle)("strokeStyle", obj.style.strokeStyle)("lineWidth", obj.style.lineWidth);
        else if (obj instanceof DrawingText)
            _VALUE_.set("fillStyle", obj.style.fillStyle)("font", obj.style.fontSize * PR + "px " + obj.style.fontFamily)("textAlign", obj.style.textAlign);
    },
    reset: obj => {
        _VALUE_.reset("globalAlpha")("shadowColor")("shadowBlur")("shadowOffsetX")("shadowOffsetY");
        if (obj instanceof DrawingShape)
            _VALUE_.reset("fillStyle")("strokeStyle")("lineWidth");
        else if (obj instanceof DrawingText)
            _VALUE_.reset("fillStyle")("font")("textAlign");
    },
    rotation: {
        a: 0, b: 0, x: 0, y: 0, w: 0, h: 0,
        start: function (obj) {
            if (obj.rotation.degree === 0) return;
            obj.rotation.isRotating = true;
            this.a = ((this.x = obj.position.x) + (this.w = obj.dimensions.width / 2)) * PR;
            this.b = ((this.y = obj.position.y) + (this.h = obj.dimensions.height / 2)) * PR;
            ctx.translate(this.a, this.b);
            obj.position.set(-this.w, -this.h);
            ctx.rotate(obj.rotation.degree * Degrees);
        },
        end: function (obj) {
            if (obj.rotation.degree === 0) return;
            ctx.rotate(-obj.rotation.degree * Degrees);
            ctx.translate(-this.a, -this.b);
            obj.position.set(this.x, this.y);
            obj.rotation.isRotating = false;
        }
    },
    start: obj => {
        _DRAWING_.set(obj);
        _DRAWING_.rotation.start(obj);
        obj._draw_();
        _DRAWING_.rotation.end(obj);
        _DRAWING_.reset(obj);
    }
};