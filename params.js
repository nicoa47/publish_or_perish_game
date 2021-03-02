var n_participants = 2;
var participant_color = "orange";
var participant_size = 70;
var sample_aabb = [
    {x: canvas.width/2,                         y: canvas.height/4 + canvas.height/5},
    {x: canvas.width/2,                         y: canvas.height/4},
    {x: canvas.width/4,                         y: canvas.height/4},
    {x: canvas.width/4,                         y: 3*canvas.height/4},
    {x: canvas.width/2,                         y: 3*canvas.height/4},
    {x: canvas.width/2,                         y: 3*canvas.height/4 - canvas.height/5},
];
var line_width = 4;
var n_simulation_steps = 10;
var door_rot_speed = 0.01; // in radians per frame


// derived variables
sample_aabb_xs = [];
sample_aabb_ys = [];
for (let i = 0; i < sample_aabb.length; i++) {
    sample_aabb_xs.push(sample_aabb[i].x);
    sample_aabb_ys.push(sample_aabb[i].y);
}

var door_length = canvas.height/2 - 2*canvas.height/5;
var door_hinge_pos = sample_aabb[sample_aabb.length-1];