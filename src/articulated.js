class Articulated {

    // tambahin aja ntar

    constructor(name, vertices, indices, rotationLimit, rotationAngle, transformMatrix) {
        this.name = name
        this.vertices = vertices;
        this.indices = indices;
        this.rotationLimit = rotationLimit
        this.rotationAngle = 0
        this.transformMatrix = transformMatrix
    }

    getVertices() { return this.vertices; }

    setVertices(vertices) { this.vertices = vertices}

    getIndices() { return this.indices; }

    getIndicesLength() { return this.indices.length; }

    getName() { return this.name; }

    getRotationLimit() { return this.rotationLimit; }

    getRotationAngle() { return this.rotationAngle; }

    setRotationAngle(rotationAngle) { this.rotationAngle = rotationAngle; }

    getTransformMatrix() { return this.transformMatrix}
    setTransformMatrix(transformMatrix) { this.transformMatrix = transformMatrix}
}