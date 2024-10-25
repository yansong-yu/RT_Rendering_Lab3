canvas = document.querySelector("#c");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl = canvas.getContext("webgl");
if (!gl) {
    alert("WebGL is not supported.")
}
vertex_shader = create_shader(gl, gl.VERTEX_SHADER, vertex_shader_code);
fragment_shader = create_shader(gl, gl.FRAGMENT_SHADER, fragment_shader_code);
program = create_program(gl, vertex_shader, fragment_shader);
position_loc = gl.getAttribLocation(program, "a_position")
normal_loc = gl.getAttribLocation(program, "a_normal")
color_loc = gl.getUniformLocation(program, 'color');
model_loc = gl.getUniformLocation(program, 'model');
proj_view_loc = gl.getUniformLocation(program, 'proj_view');
campos_loc = gl.getUniformLocation(program, 'camera_pos');

gl.useProgram(program); 
gl.clearColor(0, 0, 0, 1);
gl.enable(gl.DEPTH_TEST);

function create_vbos(scene){
    scene.create_vbos(gl);
    for (let i = 0; i < scene.get_children_count(); i++) {
        create_vbos(scene.get_child(i));
    }
}

function draw_scene(scene, model){
    gl.bindBuffer(gl.ARRAY_BUFFER, scene.vbo_v)
    gl.vertexAttribPointer(
        position_loc,
        3,                // Number of components per vertex (3 for vec3)
        gl.FLOAT,         // Data type
        false,            // Normalize
        0,                // Stride
        0                 // Offset
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, scene.vbo_n)
    gl.vertexAttribPointer(
        normal_loc,
        3,                // Number of components per vertex (3 for vec3)
        gl.FLOAT,         // Data type
        false,            // Normalize
        0,                // Stride
        0                 // Offset
    );

    gl.enableVertexAttribArray(position_loc);
    gl.enableVertexAttribArray(normal_loc);
    gl.uniform3fv(color_loc, new Float32Array(scene.color));
    gl.uniformMatrix4fv(model_loc, false, new Float32Array(transpose4x4(multiply4x4Matrices(model, scene.model_matrix))));

    // console.log(scene.get_vertex_count())
    gl.drawArrays(gl.TRIANGLES, 0, scene.get_vertex_count());

    for (let i = 0; i < scene.get_children_count(); i++) {
        draw_scene(scene.get_child(i), multiply4x4Matrices(model, scene.model_matrix));
    }
}

scene = create_windmill();
create_vbos(scene, gl);

// 6, 10, 10
let cam = new Camera([6.8177022726109975, 5.743524083182375, 7.604509621239423], [0, 0, 1], [0, 1, 0], 45, canvas.width / canvas.height, 0.1, 1000)

function render (time) { 
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    proj = cam.computeProjectionMatrix()
    view = cam.computeViewMatrix()
    proj_view = transpose4x4(multiply4x4Matrices(proj, view))
    gl.uniformMatrix4fv(proj_view_loc, false, new Float32Array(proj_view));
    gl.uniform3fv(campos_loc, cam.position)
    scene.get_child(0).get_child(0).rotate(0, 0.5, 0)
    draw_scene(scene, get_identity_matrix())
    requestAnimationFrame(render);
}
requestAnimationFrame(render);


//////// event

// Event listener for keydown
window.addEventListener("keydown", (event) => {
    if(["w", "a", "s", "d"].includes(event.key)){
        let [x, y, z] = cam.get_cam_axis()
        let speed = 0.5
        if(event.key == 'w') scene.translate(speed * -z[0], speed * -z[1], speed * -z[2]);
        if(event.key == 's') scene.translate(speed * z[0], speed * z[1], speed * z[2]);
        if(event.key == 'a') scene.translate(speed * -x[0], speed * -x[1], speed * -x[2]);
        if(event.key == 'd') scene.translate(speed * x[0], speed * x[1], speed * x[2]);
    }

    if(["R", "Y", "P"].includes(event.key)){
        let speed = 1.0
        if(event.key == 'R') cam.roll += speed;
        if(event.key == 'Y') cam.yaw += speed;
        if(event.key == 'P') cam.pitch += speed;
    }

    if(["r", "y", "p"].includes(event.key)){
        let speed = 1.0
        if(event.key == 'r') cam.roll -= speed;
        if(event.key == 'y') cam.yaw -= speed;
        if(event.key == 'p') cam.pitch -= speed;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowDown"){
        let sign = -1;
        if(event.key === "ArrowDown") sign = 1
        let speed = 0.5;
        let [x, y, z] = cam.get_cam_axis()
        cam.position[0] += sign * speed * z[0];
        cam.position[1] += sign * speed * z[1];
        cam.position[2] += sign * speed * z[2];
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight"){
        let sign = 1;
        if(event.key === "ArrowLeft") sign = -1
        let speed = 0.5;
        let [x, y, z] = cam.get_cam_axis()
        cam.position[0] += sign * speed * x[0];
        cam.position[1] += sign * speed * x[1];
        cam.position[2] += sign * speed * x[2];
    }
});

window.camera = cam;