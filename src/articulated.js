class Articulated {

    // tambahin aja ntar

    constructor(name, vertices, indices) {
        this.name = name
        this.vertices = vertices;
        this.indices = indices;
    }

    getVertices() { return this.vertices; }

    getIndices() { return this.indices; }

    getIndicesLength() { return this.indices.length; }

    getName() { return this.name; }
}