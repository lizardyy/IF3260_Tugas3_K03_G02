class Articulated {

    // tambahin aja ntar

    constructor(name, vertices, indices, transformMatrix) {
        this.name = name
        this.vertices = vertices;
        this.indices = indices;
        this.transformMatrix = transformMatrix
    }

    getVertices() { return this.vertices; }

    setVertices(vertices) { this.vertices = vertices}

    getIndices() { return this.indices; }

    getIndicesLength() { return this.indices.length; }

    getName() { return this.name; }

    getTransformMatrix() { return this.transformMatrix}
    setTransformMatrix(transformMatrix) { this.transformMatrix = transformMatrix}
}