function get_virtual_circ(coords, this_posx, this_posy, ind) {

    // console.log(coords[0].x, coords[0].y, coords[1].x, coords[1].y)
    // vertical or horizontal?
    if (coords[0].y == coords[1].y) {
        // horizontal
        var comp_dim_pos = this_posx;
        var comp_dim_coords = [coords[0].x, coords[1].x];
        var comp_dim_coords_other = [coords[0].y, coords[1].y];
        var pos = {x: this_posx, y: comp_dim_coords_other[1]};
        
    } else {
        // vertical
        var comp_dim_pos = this_posy;
        var comp_dim_coords = [coords[0].y, coords[1].y];
        var comp_dim_coords_other = [coords[0].x, coords[1].x];
        var pos = {x: comp_dim_coords_other[1], y: this_posy};
    }

    var smalldim = Math.min(comp_dim_coords[0], comp_dim_coords[1]);
    var largedim = Math.max(comp_dim_coords[0], comp_dim_coords[1]);

    if (comp_dim_pos < smalldim) {
        if   (coords[0].y == coords[1].y) pos.x = smalldim;
        else                              pos.y = smalldim;
    } else if (comp_dim_pos > largedim) {
        if   (coords[0].y == coords[1].y) pos.x = largedim;
        else                              pos.y = largedim;
    }
    return pos;
    
}

function pos_in_sample(pos) {
    if (
        pos.x < Math.max(...sample_aabb_xs) &&
        pos.x > Math.min(...sample_aabb_xs) && 
        pos.y < Math.max(...sample_aabb_ys) &&
        pos.y > Math.min(...sample_aabb_ys)
    ) { return true; }
    return false;
}

function closest_point_dist_from_origin(coords1, coords2) {
    // create the vector from two coords
    var vec1 = {x: coords1[1].x - coords1[0].x, y: coords1[1].y - coords1[0].y};
    var vec2 = {x: coords2[1].x - coords2[0].x, y: coords2[1].y - coords2[0].y};

    var dp = vec1.x*vec2.x + vec1.y*vec2.y;
    var ll = vec1.x*vec1.x + vec1.y*vec1.y; // line length from vec1
    return Math.max(0, Math.min(ll, dp))/ll;

}

function coll_resolution(this_pos, this_radius, other_pos, other_radius) {
    if (circle_overlap({pos: this_pos, radius: this_radius}, {pos: other_pos, radius: other_radius})) {
        // correct for overlap
        var dist_vect = {x: other_pos.x - this_pos.x, y: other_pos.y - this_pos.y};
        var len = distance(this_pos, other_pos);
        var unit_dist_vect = {x: dist_vect.x/len, y: dist_vect.y/len};
        var ball_overlap = Math.min(Math.min(this_radius, other_radius), (this_radius/2 + other_radius/2) - len);
        var corr_vect = {x: unit_dist_vect.x*ball_overlap, y: unit_dist_vect.y*ball_overlap};
        // catch case of complete overlap
        if (isNaN(corr_vect.x) || isNaN(corr_vect.y)) {
            // console.log("here")
            this_pos.x -= 0.001;
            this_pos.y -= 0;
        } else {
            this_pos.x -= corr_vect.x;
            this_pos.y -= corr_vect.y;
        }
        
    }
    return this_pos;
}

function coord_from_angle_pos_dist(angle, pos, dist) {
    return {
        x: pos.x + dist*Math.cos(angle),
        y: pos.y + dist*Math.sin(angle)
    };
}





// TODO: sort out the old functions (whether needed)


// global vars
var center_coord = {x: canv_w/2, y: canv_h/2};
var gravity = 30;
// var n_simulation_steps = 1;
// debug version:
var friction = 0.95;
var vel_factor = 0.05;
var str_factor = 35;

function sort_nums(a, b) {
    return a - b;
}

function coord_game_space(coord) {
    // adjust for global translation
    coord.x -= current_translate.x;
    coord.y -= current_translate.y;
    coord.x /= current_scale;
    coord.y /= current_scale;
    return coord;
}

function get_pos(e) {
    var x_val = e.clientX;
    var y_val = e.clientY;
    var coord = {x: x_val, y: y_val};
    return coord_game_space(coord);
}

function rad_to_degree(rad) {
    // convert radians to degree
    // i.e. 0 - 2*PI --> 0 - 360
    var unitless = rad/(2*Math.PI);
    return unitless*360;
}

function rad_to_coord(rad, distance, coord) {
    var X = coord.x + distance*Math.cos(rad);
    var Y = coord.y + distance*Math.sin(rad);
    return {x: X, y: Y};
}

function len_dir_to_vec(len, rad) {
    return {x: Math.cos(rad)*len, y: Math.sin(rad)*len};
}

function distance(pos1, pos2) {
    var xdiff = pos2.x - pos1.x;
    var ydiff = pos2.y - pos1.y;
    return Math.sqrt(xdiff*xdiff + ydiff*ydiff);
}

function circle_overlap(circ1, circ2) {
    var dist = distance(circ1.pos, circ2.pos);
    return dist < (circ1.radius/2 + circ2.radius/2);
}

function get_circle_overlap(circ1, circ2) {
    var dist = distance(circ1.pos, circ2.pos);
    return (circ1.radius/2 + circ2.radius/2) - dist;
}

// not tested! --> sth wrong
function square_square_overlap(rect1, rect2) {
    // rect: pos (lower left), size (w || h)
    // test each corner of one rect against dimension bounds of other
    // crit: if ANY corner is inside BOTH dimensions (x, y)

    // 1. calculate each point of rect2
    var list_of_points = [];
    list_of_points.push({x: rect2.pos.x,                 y: rect2.pos.y});
    list_of_points.push({x: rect2.pos.x + rect2.size,    y: rect2.pos.y});
    list_of_points.push({x: rect2.pos.x,                 y: rect2.pos.y + rect2.size});
    list_of_points.push({x: rect2.pos.x + rect2.size,    y: rect2.pos.y + rect2.size});

    // test each point, break if any overlap
    for (let i = 0; i < list_of_points.length; i++) {
        const c = list_of_points[i];
        if ((c.x >= rect1.pos.x && c.x <= rect1.pos.x + rect1.size) 
        && ( c.y >= rect1.pos.y && c.y <= rect1.pos.y + rect1.size)) {
            return true;
        }
    }

    return false;
}

function get_square_square_overlap_amount(rect1, rect2) {
    // i.e. find two middle values for each axis
    // put up two containers, one for each axis
    var x_cont = [rect1.pos.x, rect1.pos.x + rect1.size, rect2.pos.x, rect2.pos.x + rect2.size];
    var y_cont = [rect1.pos.y, rect1.pos.y + rect1.size, rect2.pos.y, rect2.pos.y + rect2.size];
    // sort 'em
    x_cont.sort(sort_nums);
    y_cont.sort(sort_nums);
    x_overlap_len = x_cont[2] - x_cont[1];
    y_overlap_len = y_cont[2] - y_cont[1];
    return {x: x_overlap_len, y: y_overlap_len};
}

function set_color_opacity(rgb_str, alpha) {
    return rgb_str + alpha + ")";
}

function vec_add_val(vec, val) {
    return {x: vec.x + val, y: vec.y + val};
}

function vec_add_vec(vec1, vec2) {
    return {x: vec1.x + vec2.x, y: vec1.y + vec2.y};
}

