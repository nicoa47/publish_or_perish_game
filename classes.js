class Participant {
    constructor(startx, starty, color, ind) {
        this.pos = {x: startx, y: starty};
        this.color = color;
        this.virtual_circs = [];
        this.radius = participant_size;
        this.in_sample = false;
        this.ind = ind;
        this.door_pos_meet = {x: 0, y: 0}; // debug
        this.dragged = false; // debug
    }
    collision_detect() {
        // identify virtual circle depending on x and y values

        // reset
        this.virtual_circs = [];

        var collided = false;

        // // loop through every wall 
        for (let i = 0; i < sample_aabb.length - 1; i++) {
            const vp = get_virtual_circ([sample_aabb[i], sample_aabb[i + 1]], this.pos.x, this.pos.y, i);
            this.virtual_circs.push(vp);

            // // intersection?
            // if (circle_overlap(
            //     {
            //         pos: {x: this.pos.x, y: this.pos.y}, 
            //         radius: this.radius
            //     },
            //     {
            //         pos: vp, 
            //         radius: line_width
            //     })) {
            //         collided = true;
            // }

        }

        // in addition also the door
        var door_coords = door.get_coords();
        var cpo = closest_point_dist_from_origin(
            door_coords,
            [door_coords[0], this.pos]
        );
        // get absolute length
        cpo = cpo * door_length;
        // get absolute position
        const vp = {
            // x: door_hinge_pos.x - cpo*Math.cos((door.angle + Math.PI)%(2*Math.PI)),
            // y: door_hinge_pos.y - cpo*Math.sin((door.angle + Math.PI)%(2*Math.PI))
            x: door_hinge_pos.x + cpo*Math.cos(door.angle),
            y: door_hinge_pos.y + cpo*Math.sin(door.angle)
        };
        // console.log(Math.cos(door.angle%Math.PI), Math.sin(door.angle%Math.PI))
        this.virtual_circs.push(vp);
        this.door_pos_meet = vp; // debug
        

    }
    collision_resolution() {

        // velocity
        this.vel = {x: this.pos.x - this.old_pos.x, y: this.pos.y - this.old_pos.y};
        // simulation steps
        var step_x = this.vel.x / n_simulation_steps;
        var step_y = this.vel.y / n_simulation_steps;

        for (let index = 0; index < n_simulation_steps; index++) {

            // change position of door if necessary
            door.update(door_rot_speed/(n_simulation_steps*participant_pool.length));

            // step position forward
            this.pos.x += step_x;
            this.pos.y += step_y;

            // did collision occur?
            this.collision_detect();

            // also check participants against each other
            var participant_collisions = [];
            for (let i = 0; i < participant_pool.length; i++) { 
                const other = participant_pool[i];
                // check for collision necessary? Only if near enough
                if (i == this.ind) {
                // if (other.pos.x == this.pos.x && other.pos.y == this.pos.y) {
                    continue; // means: is self
                }
                
                // otherwise: is other --> how far is distance?
                if (other.pos.x >= this.pos.x - 2*this.radius &&
                    other.pos.x <= this.pos.x + 2*this.radius &&
                    other.pos.y >= this.pos.y - 2*this.radius &&
                    other.pos.y <= this.pos.y + 2*this.radius) {
                        participant_collisions.push(other.pos);
                    }
            }

            for (let i = 0; i < this.virtual_circs.length; i++) {
                const cp = this.virtual_circs[i];
                var new_pos = coll_resolution(this.pos, this.radius, cp, line_width);
                this.pos.x = new_pos.x; this.pos.y = new_pos.y;
            }
            for (let i = 0; i < participant_collisions.length; i++) {
                const cp = participant_collisions[i];
                var new_pos = coll_resolution(this.pos, this.radius, cp, this.radius);
                this.pos.x = new_pos.x; this.pos.y = new_pos.y;
            }
            
        }

    }
    update() {

        // check if in sample
        if (pos_in_sample(this.pos)) {
                this.in_sample = true;
            } else {
                this.in_sample = false;
            }

        // debug: change color if in sample
        // if (this.in_sample) this.color = "green";
        // else this.color = participant_color;

        // store old pos
        this.old_pos = {x: this.pos.x, y: this.pos.y};

        // position updates
        // debug
        if (this.dragged) {
            this.pos.x = current_mouse_pos.x;
            this.pos.y = current_mouse_pos.y;
            this.old_pos = {x: this.pos.x, y: this.pos.y};
        } else {

            var xstep = Math.floor(Math.random()*3) - 1;
            var ystep = Math.floor(Math.random()*3) - 1;
            this.pos.x += xstep;
            this.pos.y += ystep;
            if (this.pos.x > canvas.width) {
                this.pos.x -= 1;
            }
            if (this.pos.y > canvas.height) {
                this.pos.y -= 1;
            }
            if (this.pos.x < 0) {
                this.pos.x += 1;
            }
            if (this.pos.y < 0) {
                this.pos.y += 1;
            }

        }

        // collision updates
        this.collision_resolution();

    }
    render() {
        draw_circ({x: this.pos.x, y: this.pos.y}, this.radius, true, this.color);

        // debug: show virtual circs
        // for (let i = 0; i < this.virtual_circs.length; i++) {
        //     const vc = this.virtual_circs[i];
        //     draw_circ(vc, line_width, true, "green");
        // }
        // draw_circ(this.door_pos_meet, 20, true, "blue");
    }
}

class SampleContainer {
    constructor() {
        this.AABB = sample_aabb;
    }
    render() {
        draw_line("black", this.AABB);
    }
}

class Door {
    constructor(len) {
        this.len = len;
        this.angle = 0.25*Math.PI;
        this.closed = false;
        this.during_animation = false;
    }
    get_coords() {
        var coord1 = door_hinge_pos;
        var coord2 = {
            x: coord1.x + door_length*Math.cos(this.angle),
            y: coord1.y + door_length*Math.sin(this.angle)
        };
        return [coord1, coord2];
    }
    change_state_animation() {
        if (!this.during_animation) {
            this.during_animation = true;
        }
    }
    update(angle_change=door_rot_speed) {
        if (this.during_animation) {
            if (this.closed) {
                // start opening animation
                this.angle += angle_change;
                this.angle = this.angle%(2*Math.PI);
                // check for completion
                if (this.angle >= 0.25*Math.PI && this.angle < Math.PI) {
                    this.angle = 0.25*Math.PI;
                    this.during_animation = false;
                    this.closed = false;
                }
            } else {
                // start closing animation
                this.angle -= angle_change;
                if (this.angle < 0) this.angle += 2*Math.PI;
                // check for completion
                if (this.angle <= 1.5*Math.PI && this.angle > Math.PI) {
                    this.angle = 1.5*Math.PI;
                    this.during_animation = false;
                    this.closed = true;
                }
            }
        }
    }
    render() {
        draw_line("black", this.get_coords());
    }
}