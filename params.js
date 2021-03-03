// TODO change absolute to relative (to canvas size) values

var n_participants = 20;
var participant_color = "orange";
var sample_aabb = [
    {x: canvas.width/2,                         y: canvas.height/4 + canvas.height/5},
    {x: canvas.width/2,                         y: canvas.height/4},
    {x: canvas.width/4,                         y: canvas.height/4},
    {x: canvas.width/4,                         y: 3*canvas.height/4},
    {x: canvas.width/2,                         y: 3*canvas.height/4},
    {x: canvas.width/2,                         y: 3*canvas.height/4 - canvas.height/5},
];
var line_width = 4;
var n_simulation_steps = 50;
var door_rot_speed = 0.05; // in radians per frame
var participant_speed = 0.2;
var participant_turn_speed = 0.5; // maximum  change in rotation per frame in radians

// TODO understand & clean up the following vars
// stick figure
var head_r = (canvas.height + canvas.width)/100;
var leg_height = head_r
var decap_height = 2*leg_height; // (how tall is stick figure w-out its head)
var height = (decap_height + 1.5*head_r); // total height of stick fig (?)
var width = head_r;
var arm_rel_pos_body = 0.5;
var body_l = (canvas.height + canvas.width)/50;
var arm_joint_height = leg_height + (1 - arm_rel_pos_body)*body_l; //decap_height/2;
var participant_size = width; // important for collision resolution

// derived variables
sample_aabb_xs = [];
sample_aabb_ys = [];
for (let i = 0; i < sample_aabb.length; i++) {
    sample_aabb_xs.push(sample_aabb[i].x);
    sample_aabb_ys.push(sample_aabb[i].y);
}

var door_length = canvas.height/2 - 2*canvas.height/5;
var door_hinge_pos = sample_aabb[sample_aabb.length-1];