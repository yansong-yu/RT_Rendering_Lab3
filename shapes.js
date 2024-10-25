class Shape{
    constructor(shape_dict, color=[1, 1, 1]){
        this.shape_dict = shape_dict;
        this.color = color;
        this.model_matrix = get_identity_matrix()
        this.children = []
        this.vbo_v = null;
        this.vbo_n = null;
    }

    create_vbos(gl){
        this.vbo_v = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo_v);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.shape_dict.vertices), gl.STATIC_DRAW);
        this.vbo_n = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo_n);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.shape_dict.normals), gl.STATIC_DRAW);
    }

    scale(s){
        this.model_matrix = multiply4x4Matrices(this.model_matrix, get_scale_matrix(s));
    }

    translate(tx, ty, tz){
        this.model_matrix = multiply4x4Matrices(get_translation_matrix(tx, ty, tz), this.model_matrix);
    }

    rotate(tx, ty, tz){
        this.model_matrix = multiply4x4Matrices(this.model_matrix, get_rotate_matrix(tx / 180 * Math.PI, ty / 180 * Math.PI, tz / 180 * Math.PI));
    }

    get_vertex_count(){
        return (this.shape_dict.vertices.length) / 3;
    }

    add_child(shape){
        this.children.push(shape)
    }

    get_child(i){
        return this.children[i];
    }

    get_children_count(){
        return this.children.length;
    }
}

function computeNormal(v1, v2, v3) {
    const u = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
    const v = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];

    const normal = [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0],
    ];

    const length = Math.sqrt(normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2);
    return [normal[0] / length, normal[1] / length, normal[2] / length];
}

function generateSphere(radius, slices, stacks) {
    const vertices = [];
    const normals = [];
  
    for (let stackNumber = 0; stackNumber <= stacks; stackNumber++) {
      const theta = (stackNumber * Math.PI) / stacks; // From 0 to PI
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
  
      for (let sliceNumber = 0; sliceNumber <= slices; sliceNumber++) {
        const phi = (sliceNumber * 2 * Math.PI) / slices; // From 0 to 2PI
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
  
        const x = radius * sinTheta * cosPhi;
        const y = radius * cosTheta;
        const z = radius * sinTheta * sinPhi;
  
        const nx = sinTheta * cosPhi;
        const ny = cosTheta;
        const nz = sinTheta * sinPhi;
  
        vertices.push(x, y, z);
  
        normals.push(nx, ny, nz);
      }
    }
  
    const positions = [];
    const sphereNormals = [];
  
    // Generate triangle faces
    for (let stackNumber = 0; stackNumber < stacks; stackNumber++) {
      for (let sliceNumber = 0; sliceNumber < slices; sliceNumber++) {
        const first = stackNumber * (slices + 1) + sliceNumber;
        const second = first + slices + 1;
  
        // First triangle
        positions.push(
          vertices[3 * first], vertices[3 * first + 1], vertices[3 * first + 2],
          vertices[3 * second], vertices[3 * second + 1], vertices[3 * second + 2],
          vertices[3 * (first + 1)], vertices[3 * (first + 1) + 1], vertices[3 * (first + 1) + 2]
        );
        sphereNormals.push(
          normals[3 * first], normals[3 * first + 1], normals[3 * first + 2],
          normals[3 * second], normals[3 * second + 1], normals[3 * second + 2],
          normals[3 * (first + 1)], normals[3 * (first + 1) + 1], normals[3 * (first + 1) + 2]
        );
  
        // Second triangle
        positions.push(
          vertices[3 * (first + 1)], vertices[3 * (first + 1) + 1], vertices[3 * (first + 1) + 2],
          vertices[3 * second], vertices[3 * second + 1], vertices[3 * second + 2],
          vertices[3 * (second + 1)], vertices[3 * (second + 1) + 1], vertices[3 * (second + 1) + 2]
        );
        sphereNormals.push(
          normals[3 * (first + 1)], normals[3 * (first + 1) + 1], normals[3 * (first + 1) + 2],
          normals[3 * second], normals[3 * second + 1], normals[3 * second + 2],
          normals[3 * (second + 1)], normals[3 * (second + 1) + 1], normals[3 * (second + 1) + 2]
        );
      }
    }
  
    return {
      vertices: positions,
      normals: sphereNormals
    };
  }

function generateCube(size) {
    let [x, y, z] = size;
    // Cube vertices and normals (each face has 2 triangles = 6 vertices)
    const vertices = [
      // Front face (positive Z)
      -x, -y, z,    x, -y, z,    x, y, z,
      -x, -y, z,    x, y, z,    -x, y, z,
  
      // Back face (negative Z)
      x, -y, -z,   -x, -y, -z,   -x, y, -z,
      x, -y, -z,   -x, y, -z,   x, y, -z,
  
      // Left face (negative X)
      -x, -y, -z,   -x, -y, z,   -x, y, z,
      -x, -y, -z,   -x, y, z,   -x, y, -z,
  
      // Right face (positive X)
      x, -y, z,   x, -y, -z,   x, y, -z,
      x, -y, z,   x, y, -z,   x, y, z,
  
      // Top face (positive Y)
      -x, y, z,   x, y, z,   x, y, -z,
      -x, y, z,   x, y, -z,   -x, y, -z,
  
      // Bottom face (negative Y)
      -x, -y, -z,   x, -y, -z,   x, -y, z,
      -x, -y, -z,   x, -y, z,   -x, -y, z
    ];
  
    const normals = [
      // Front face normals (0, 0, 1)
      0, 0, 1,  0, 0, 1,  0, 0, 1,
      0, 0, 1,  0, 0, 1,  0, 0, 1,
  
      // Back face normals (0, 0, -1)
      0, 0, -1,  0, 0, -1,  0, 0, -1,
      0, 0, -1,  0, 0, -1,  0, 0, -1,
  
      // Left face normals (-1, 0, 0)
      -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
      -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
  
      // Right face normals (1, 0, 0)
      1, 0, 0,  1, 0, 0,  1, 0, 0,
      1, 0, 0,  1, 0, 0,  1, 0, 0,
  
      // Top face normals (0, 1, 0)
      0, 1, 0,  0, 1, 0,  0, 1, 0,
      0, 1, 0,  0, 1, 0,  0, 1, 0,
  
      // Bottom face normals (0, -1, 0)
      0, -1, 0,  0, -1, 0,  0, -1, 0,
      0, -1, 0,  0, -1, 0,  0, -1, 0
    ];
  
    return {
      vertices: vertices,
      normals: normals
    };
}

function generateCylinder(baseRadius, topRadius, height, slices, stacks) {
    const vertices = [];
    const normals = [];
    const deltaY = height / stacks;
    const deltaTheta = (2 * Math.PI) / slices;
    const slope = (baseRadius - topRadius) / height; // Used for normal calculation
  
    // Generate vertices and normals for the side surface
    for (let i = 0; i <= stacks; i++) {
      const y = i * deltaY;
      const radius = baseRadius - ((baseRadius - topRadius) * i) / stacks;
  
      for (let j = 0; j <= slices; j++) {
        const theta = j * deltaTheta;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
  
        // Position of the vertex
        const x = radius * cosTheta;
        const z = radius * sinTheta;
  
        // Normal vector components
        const normalX = cosTheta;
        const normalZ = sinTheta;
        const normalY = slope; // For side surface normals
  
        // Normalize the normal vector
        const normalLength = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ);
        const nx = normalX / normalLength;
        const ny = normalY / normalLength;
        const nz = normalZ / normalLength;
  
        // Push vertex position
        vertices.push(x, y, z);
  
        // Push normal vector
        normals.push(nx, ny, nz);
      }
    }
  
    const vertexData = {
      vertices: [],
      normals: []
    };
  
    // Generate triangle faces for the side surface
    for (let i = 0; i < stacks; i++) {
      for (let j = 0; j < slices; j++) {
        const first = i * (slices + 1) + j;
        const second = first + slices + 1;
  
        // First triangle of the quad
        vertexData.vertices.push(
          vertices[3 * first], vertices[3 * first + 1], vertices[3 * first + 2],
          vertices[3 * second], vertices[3 * second + 1], vertices[3 * second + 2],
          vertices[3 * (first + 1)], vertices[3 * (first + 1) + 1], vertices[3 * (first + 1) + 2]
        );
        vertexData.normals.push(
          normals[3 * first], normals[3 * first + 1], normals[3 * first + 2],
          normals[3 * second], normals[3 * second + 1], normals[3 * second + 2],
          normals[3 * (first + 1)], normals[3 * (first + 1) + 1], normals[3 * (first + 1) + 2]
        );
  
        // Second triangle of the quad
        vertexData.vertices.push(
          vertices[3 * (first + 1)], vertices[3 * (first + 1) + 1], vertices[3 * (first + 1) + 2],
          vertices[3 * second], vertices[3 * second + 1], vertices[3 * second + 2],
          vertices[3 * (second + 1)], vertices[3 * (second + 1) + 1], vertices[3 * (second + 1) + 2]
        );
        vertexData.normals.push(
          normals[3 * (first + 1)], normals[3 * (first + 1) + 1], normals[3 * (first + 1) + 2],
          normals[3 * second], normals[3 * second + 1], normals[3 * second + 2],
          normals[3 * (second + 1)], normals[3 * (second + 1) + 1], normals[3 * (second + 1) + 2]
        );
      }
    }
  
    // Generate vertices and normals for the top cap
    if (topRadius > 0) {
      const y = height;
      const normalY = 1; // Upward normal
  
      // Center point of the top cap
      const centerIndex = vertices.length / 3;
      vertices.push(0, y, 0);
      normals.push(0, normalY, 0);
  
      for (let j = 0; j <= slices; j++) {
        const theta = j * deltaTheta;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
  
        const x = topRadius * cosTheta;
        const z = topRadius * sinTheta;
  
        vertices.push(x, y, z);
        normals.push(0, normalY, 0);
      }
  
      // Create triangle faces for the top cap
      for (let j = 0; j < slices; j++) {
        const first = centerIndex;
        const second = centerIndex + j + 1;
        const third = centerIndex + j + 2;
  
        vertexData.vertices.push(
          vertices[3 * first], vertices[3 * first + 1], vertices[3 * first + 2],
          vertices[3 * second], vertices[3 * second + 1], vertices[3 * second + 2],
          vertices[3 * third], vertices[3 * third + 1], vertices[3 * third + 2]
        );
        vertexData.normals.push(
          normals[3 * first], normals[3 * first + 1], normals[3 * first + 2],
          normals[3 * second], normals[3 * second + 1], normals[3 * second + 2],
          normals[3 * third], normals[3 * third + 1], normals[3 * third + 2]
        );
      }
    }
  
    // Generate vertices and normals for the bottom cap
    if (baseRadius > 0) {
      const y = 0;
      const normalY = -1; // Downward normal
  
      // Center point of the bottom cap
      const centerIndex = vertices.length / 3;
      vertices.push(0, y, 0);
      normals.push(0, normalY, 0);
  
      for (let j = 0; j <= slices; j++) {
        const theta = j * deltaTheta;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
  
        const x = baseRadius * cosTheta;
        const z = baseRadius * sinTheta;
  
        vertices.push(x, y, z);
        normals.push(0, normalY, 0);
      }
  
      // Create triangle faces for the bottom cap
      for (let j = 0; j < slices; j++) {
        const first = centerIndex;
        const second = centerIndex + j + 1;
        const third = centerIndex + j + 2;
  
        vertexData.vertices.push(
          vertices[3 * first], vertices[3 * first + 1], vertices[3 * first + 2],
          vertices[3 * third], vertices[3 * third + 1], vertices[3 * third + 2],
          vertices[3 * second], vertices[3 * second + 1], vertices[3 * second + 2]
        );
        vertexData.normals.push(
          normals[3 * first], normals[3 * first + 1], normals[3 * first + 2],
          normals[3 * third], normals[3 * third + 1], normals[3 * third + 2],
          normals[3 * second], normals[3 * second + 1], normals[3 * second + 2]
        );
      }
    }
  
    return vertexData;
}