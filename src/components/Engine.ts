import { getGLContext } from "../util/GL";
import { Shader } from "../util/Shader";


export class Engine {
    private gl: WebGL2RenderingContext;
    private canvas: HTMLCanvasElement;
    private shader: Shader;
    private VAO: WebGLVertexArrayObject | null;
    private indices: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
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

    public genVAO(vertices: number[], indices: number[]): void {

        this.indices = indices.length;

        const VAO = this.gl.createVertexArray()!;
        const VBO = this.gl.createBuffer()!;
        const EBO = this.gl.createBuffer()!;

        this.gl.bindVertexArray(VAO);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, VBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(0);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, EBO);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

        this.gl.bindVertexArray(null);

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