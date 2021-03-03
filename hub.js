var current_mouse_pos = {x: 0, y: 0}; // keeping track of current mouse position

// add event listeners
document.addEventListener('mousedown', mousedown);
document.addEventListener('mouseup', mouseup);
document.addEventListener('mousemove', mousemove);
document.addEventListener("keydown", keydown);
document.addEventListener('keyup', keyup);

/*
for (let index = 0; index < 100; index++) {
    // randomly generate pixels
    var x_rand = Math.floor(Math.random() * canv_w);
    var y_rand = Math.floor(Math.random() * canv_h);
    const coord = {x: x_rand, y: y_rand};
    terrainpixel.push(new TerrainPixel(coord, index));
}
*/

// initialization
var door = new Door();
participant_pool = [];
for (let i = 0; i < n_participants; i++) {
    var randx = Math.random()*canvas.width;
    var randy = Math.random()*canvas.height;
    while (pos_in_sample({x: randx, y: randy})) {
        var randx = Math.random()*canvas.width;
        var randy = Math.random()*canvas.height;
    }
    participant_pool.push(new Participant(randx, randy, participant_color, i));
}
var sample_container = new SampleContainer();

// test: add half circle to static obj

// global functions

cd_1 = new Date();
cd_2 = new Date();

function update() {
    cd_1 = new Date();
    for (let i = 0; i < participant_pool.length; i++) {
        const participant = participant_pool[i];
        participant.update();
    }
    door.update();
    render();
    requestAnimationFrame(update);
}

function render() {
    clear_canvas("white");
    sample_container.render();
    for (let i = 0; i < participant_pool.length; i++) {
        const participant = participant_pool[i];
        participant.render();
    }
    door.render();
    cd_2 = new Date();
    draw_debug_text("FPS: " + String(1000 / (cd_2 - cd_1)));
}

// listener functions
function mousedown(e) {
    if (e.button == 0) {
        // LMB
        // grab a participant circle
        for (let i = 0; i < participant_pool.length; i++) {
            const participant = participant_pool[i];
            if (distance(current_mouse_pos, participant.pos) < participant_size) {
                participant_pool[i].color = "blue";
                participant_pool[i].dragged = true;
                break;
            }
        }
    }
}

function mouseup(e) {
    // mostly for debugging
    for (let i = 0; i < participant_pool.length; i++) {
        participant_pool[i].color = participant_color;
        participant_pool[i].dragged = false;
    }
}

function mousemove(e) {
    // adjust current position
    current_mouse_pos = get_pos(e);
}

function keydown(e) {

    if (e.keyCode == 13) {
        // Enter
    }
    if (e.keyCode == 37) {
    } // LEFT
    if (e.keyCode == 39) {
    } // RIGHT
    if (e.keyCode == 38) {
    } // UP
    if (e.keyCode == 40) {} // DOWN
    // other key codes:
    // 27 ESC 32 SPACE 18 ALT 16 SHIFT 17 CTRL
    // for letters use e.code, e.g. e.code == "KeyJ":
    if (e.keyCode == 32) {
        door.change_state_animation();
    }
}

function keyup(e) {
    if (e.keyCode == 13) {
        // Enter
    }
    if (e.keyCode == 37) {
    } // LEFT
    if (e.keyCode == 39) {
    } // RIGHT
    if (e.keyCode == 38) {
    } // UP
    if (e.keyCode == 40) {} // DOWN
}

update();