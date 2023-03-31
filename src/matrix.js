function identity(out) {
    out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 0;
    out[4] = 0; out[5] = 1; out[6] = 0; out[7] = 0;
    out[8] = 0; out[9] = 0; out[10] = 1; out[11] = 0;
    out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;
    return out;
}

function rotate(out, a, rad, axis) {
    let x = axis[0], y = axis[1], z = axis[2];
    let len = Math.sqrt(x * x + y * y + z * z);
    let s, c, t;
    let b00, b01, b02;
    let b10, b11, b12;
    let b20, b21, b22;

    if (len === 0) {
        // no rotate
        return null;
    }

    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    const mRotation = []

    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

    mRotation.push(
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22)
    mult(out, a, mRotation)

    // copy matrix yang tidak berubah
    if (a !== out) {
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    return out;
}

function mult(out, a, b) {


    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
            let sum = 0;
            for (let k = 0; k < 3; k++) {
                sum += b[3 * i + k] * a[4 * k + j];

            }
            out[4 * i + j] = sum;
        }
    }

}
function lookAt(out, eye, center, up) {
    let zAxis = normalize(subtract(eye, center));
    let xAxis = normalize(cross(up, zAxis));
    let yAxis = cross(zAxis, xAxis);

    out[0] = xAxis[0]; out[1] = yAxis[0]; out[2] = zAxis[0]; out[3] = 0;
    out[4] = xAxis[1]; out[5] = yAxis[1]; out[6] = zAxis[1]; out[7] = 0;
    out[8] = xAxis[2]; out[9] = yAxis[2]; out[10] = zAxis[2]; out[11] = 0;
    out[12] = -dot(xAxis, eye); out[13] = -dot(yAxis, eye); out[14] = -dot(zAxis, eye); out[15] = 1;
}

function perspective(out, fov, aspect, near, far) {
    let f = 1.0 / Math.tan(fov / 2);
    let nf = 1 / (near - far);

    out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0;
    out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
    out[8] = 0; out[9] = 0; out[10] = (far + near) * nf; out[11] = -1;
    out[12] = 0; out[13] = 0; out[14] = 2 * far * near * nf; out[15] = 0;
}

function orthographic(out, left, right, bottom, top, near, far) {
    out[0] = 2 / (right - left); out[1] = 0; out[2] = 0; out[3] = 0;
    out[4] = 0; out[5] = 2 / (top - bottom); out[6] = 0; out[7] = 0;
    out[8] = 0; out[9] = 0; out[10] = 2 / (near - far); out[11] = 0;
    out[12] = (left + right) / (left - right); out[13] = (bottom + top) / (bottom - top); out[14] = (near + far) / (near - far); out[15] = 1;
}

function oblique(out, left, right, bottom, top, near, far, alpha, phi){
    let cotAlpha = 1 / Math.tan(alpha);
    let cotPhi = 1 / Math.tan(phi);

    out[0] = 2 / (right - left); out[1] = 0; out[2] = 0; out[3] = 0;
    out[4] = 0; out[5] = 2 / (top - bottom); out[6] = 0; out[7] = 0;
    out[8] = cotAlpha; out[9] = cotPhi; out[10] = 2 / (near - far); out[11] = 0;
    out[12] = (left + right) / (left - right); out[13] = (bottom + top) / (bottom - top); out[14] = (near + far) / (near - far); out[15] = 1;
}

function normalize(vec) {
    const len = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
    if (len > 0) {
        vec[0] /= len;
        vec[1] /= len;
        vec[2] /= len;
    }
    return vec;
}

function subtract(a, b) {
    var out = new Float32Array(a.length);
    for (let i = 0; i < a.length; i++) {
        out[i] = a[i] - b[i];
    }
    return out;
}

function cross(a, b) {
    var out = new Float32Array(3);
    out[0] = a[1] * b[2] - a[2] * b[1];
    out[1] = a[2] * b[0] - a[0] * b[2];
    out[2] = a[0] * b[1] - a[1] * b[0];
    return out;
}

function dot(a, b) {
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result += a[i] * b[i];
    }
    return result;
}
