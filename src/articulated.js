class Articulated {

    // tambahin aja ntar

    constructor(name, vertices, indices, children, rotationCoord, rotationAxis, rotationLimit, rotationAngle, transformMatrix, state) {
        this.name = name
        this.vertices = vertices;
        this.indices = indices;
        this.children = children;
        this.rotationCoord = rotationCoord
        this.rotationAxis = rotationAxis
        this.rotationLimit = rotationLimit
        this.rotationAngle = 0
        this.transformMatrix = transformMatrix
        this.state = {
            rotAngle: [0, 0, 0, 0],
            translation: [0, 0, 0],
            scale: [1, 1, 1],
            camAngle: 0,
            camRadius: 5,
            animation: false,
            number: 0,
            shading: true,
            customMapping: false,
            reflectiveMapping: false,
            bumpMapping: false,
            lightDirection: [1, 1, 1],

        }
    }

    getVertices() { return this.vertices; }

    setVertices(vertices) { this.vertices = vertices}

    getIndices() { return this.indices; }

    getIndicesLength() { return this.indices.length; }

    getName() { return this.name; }

    getChildren() { return this.children; }

    getRotationCoord() { return this.rotationCoord; }

    getRotationAxis() { return this.rotationAxis; }

    getRotationLimit() { return this.rotationLimit; }

    getRotationAngle() { return this.rotationAngle; }

    setRotationAngle(rotationAngle) { this.rotationAngle = rotationAngle; }

    getTransformMatrix() { return this.transformMatrix}
    setTransformMatrix(transformMatrix) { this.transformMatrix = transformMatrix}
}