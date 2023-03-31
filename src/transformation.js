var transformMatrix = {
    translation: function (tx, ty, tz) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1,
        ];
    },

    projection: function (width, height, depth) {
        // Note: This matrix flips the Y axis so 0 is at the top.
        return [
            2 / width, 0, 0, 0,
            0, 2 / height, 0, 0,
            0, 0, 2 / depth, 0,
            0, 0, 0, 1,
        ];
    },

    translate: function (m, tx, ty, tz) {
        return transformMatrix.multiply(m, transformMatrix.translation(tx, ty, tz));
    },
    xRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ];
    },

    yRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ];
    },

    zRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    },

    scaling: function (sx, sy, sz) {
        return [
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1,
        ];
    },

    translate: function (m, tx, ty, tz) {
        return transformMatrix.multiply(m, transformMatrix.translation(tx, ty, tz));
    },

    xRotate: function (m, angleInRadians) {
        return transformMatrix.multiply(m, transformMatrix.xRotation(angleInRadians));
    },

    yRotate: function (m, angleInRadians) {
        return transformMatrix.multiply(m, transformMatrix.yRotation(angleInRadians));
    },

    zRotate: function (m, angleInRadians) {
        return transformMatrix.multiply(m, transformMatrix.zRotation(angleInRadians));
    },

    allRotate: function (m, angleX, angleY, angleZ){
        return transformMatrix.zRotate(transformMatrix.yRotate(transformMatrix.xRotate(m, angleX),angleY),angleZ)
    },
    scale: function (m, sx, sy, sz) {
        return transformMatrix.multiply(m, transformMatrix.scaling(sx, sy, sz));
    },

    multiply: function(a,b){
        const out = []
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += b[4 * i + k] * a[4 * k + j];

                }
                out[4 * i + j] = sum;
            }
        }

        return out;
    }
};