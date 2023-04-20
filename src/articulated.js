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
        this.state = state
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