// user parameters
var hori_ratio          = 1920/1080;    // fixed to realistic value

// init of global vars
var current_scale       = 1;            // keeping track of scale
var current_translate   = {x: 0, y: 0}; // keeping track of translation
var canv_w;
var canv_h;
var smaller_dim;
var larger_dim; 
var prev_orient;

var canvas = document.getElementById("GameCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight*0.5;
canv_w = window.innerWidth;
canv_h = window.innerHeight*0.5;
var ctx = canvas.getContext("2d");