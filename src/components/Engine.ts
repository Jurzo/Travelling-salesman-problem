import { getGLContext } from "../util/GL";
import { Shader } from "../util/Shader";


export class Engine {
    private gl: WebGL2RenderingContext;
    private shader: Shader;
    private VAO: WebGLVertexArrayObject | null;
    private indices: number;

    constructor(canvas: HTMLCanvasElement) {
        this.gl = getGLContext(canvas);
        this.shader = this.loadShaders();
        this.VAO = null;
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.indices = 0;
    }

    public start(): void {
        this.loop();
    }


    private loop(): void {
        if (this.VAO) {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.useProgram(this.shader.getProgram());
            this.gl.bindVertexArray(this.VAO);
            this.gl.lineWidth(5);
            this.gl.drawElements(this.gl.LINE_STRIP, this.indices, this.gl.UNSIGNED_SHORT, 0);
            this.gl.bindVertexArray(null);
        }
        requestAnimationFrame(this.loop.bind(this));
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
        this.indices = indices.length;
        this.gl.bindVertexArray(VAO);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, EBO);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

        this.gl.bindVertexArray(null);
    }

    public genNodeVAO(vertices: number[], indices: number[]): void {
        const VAO = this.genVAO(vertices);
        this.genIndexData(VAO, indices);

        this.VAO = VAO;
    }

    private loadShaders(): Shader {
        const vertexShaderSource =
            `#version 300 es
        layout (location = 0) in vec3 aPos;

        void main() {
            gl_Position = vec4(aPos, 1.0);
        }`;

        const fragmentShaderSource =
            `#version 300 es
        precision highp float;
        out vec4 fragColor;


        void main() {
            fragColor = vec4(1.0);
        }`;

        return new Shader("basic", this.gl, vertexShaderSource, fragmentShaderSource);
    }
}