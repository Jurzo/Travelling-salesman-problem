import { getGLContext } from "../util/GL";
import { Shader } from "../util/Shader";

export class Renderer {
    private gl: WebGL2RenderingContext;
    private routeShader: Shader;
    private pheromoneShader: Shader;
    private route: WebGLVertexArrayObject | null;
    private routeIndices: number;
    private trail: WebGLVertexArrayObject | null;
    private trailIndices: number;
    private trailWeights: number[];

    constructor(canvas: HTMLCanvasElement) {
        this.gl = getGLContext(canvas);
        this.routeShader = this.loadShaders(routeVS, routeFS, 'route');
        this.pheromoneShader = this.loadShaders(pheromoneVS, pheromoneFS, 'trail');
        this.route = null;
        this.routeIndices = 0;
        this.trail = null;
        this.trailIndices = 0;
        this.trailWeights = [];
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.disable(this.gl.DEPTH_TEST);
    }

    public setWeights(weights: number[]): void {
        this.trailWeights = weights;
    }

    public draw(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.route && this.drawRoute();
        this.trail && this.drawPheromones();
        //requestAnimationFrame(this.loop.bind(this));
    }

    private drawPheromones(): void {
        this.gl.useProgram(this.pheromoneShader.getProgram());
        this.gl.bindVertexArray(this.trail);
        this.pheromoneShader.setVec2([0.5, 0.5], 'uOffset');
        this.pheromoneShader.setFloat(0.5, 'scale');
        for (let i = 0; i < this.trailIndices; i += 2) {
            this.pheromoneShader.setFloat(this.trailWeights[i / 2], 'weight');
            this.gl.drawElements(this.gl.LINES, 2, this.gl.UNSIGNED_SHORT, i * 2);
        }
        this.gl.bindVertexArray(null);
    }

    private drawRoute(): void {
        this.gl.useProgram(this.routeShader.getProgram());
        this.gl.bindVertexArray(this.route);
        this.routeShader.setFloat(0.5, 'scale');
        this.routeShader.setVec2([-0.5, 0.5], 'uOffset');
        this.gl.drawElements(this.gl.POINTS, this.routeIndices, this.gl.UNSIGNED_SHORT, 0);
        this.gl.drawElements(this.gl.LINE_STRIP, this.routeIndices, this.gl.UNSIGNED_SHORT, 0);
        this.gl.bindVertexArray(null);
    }

    public genVAO(vertices: number[]): WebGLVertexArrayObject {
        const VAO = this.gl.createVertexArray()!;
        const VBO = this.gl.createBuffer()!;

        this.gl.bindVertexArray(VAO);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, VBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(0);

        this.gl.bindVertexArray(null);

        return VAO;
    }

    public genIndexData(VAO: WebGLVertexArrayObject, indices: number[]): void {
        const EBO = this.gl.createBuffer()!;
        this.gl.bindVertexArray(VAO);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, EBO);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

        this.gl.bindVertexArray(null);
    }

    public genRouteVAO(vertices: number[], indices: number[]): void {
        this.route = this.genVAO(vertices);
        this.genIndexData(this.route, indices);
        this.routeIndices = indices.length;
    }

    public genTrailVAO(vertices: number[], indices: number[]): void {
        this.trail = this.genVAO(vertices);
        this.genIndexData(this.trail, indices);
        this.trailIndices = indices.length;
    }

    private loadShaders(VS: string, FS: string, name: string): Shader {
        return new Shader(name, this.gl, VS, FS);
    }
}

const routeVS =
    `#version 300 es
layout (location = 0) in vec3 aPos;

uniform vec2 uOffset;
uniform float scale;

void main() {
    vec3 offset = vec3(uOffset, 0.0);
    gl_Position = vec4(aPos * scale + offset, 1.0);
    gl_PointSize = 5.0 * scale;
}`;

const routeFS =
    `#version 300 es
precision highp float;
out vec4 fragColor;

void main() {
    fragColor = vec4(1.0);
}`;

const pheromoneVS =
    `#version 300 es
layout (location = 0) in vec3 aPos;

uniform vec2 uOffset;
uniform float scale;

void main() {
    vec3 offset = vec3(uOffset, 0.0);
    gl_Position = vec4(aPos * scale + offset, 1.0);
}`;

const pheromoneFS =
    `#version 300 es
precision highp float;
out vec4 fragColor;

uniform float weight;

void main() {
    fragColor = vec4(1.0, 0.0, 0.0, 1.0) * weight;
}`;