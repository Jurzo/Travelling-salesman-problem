export class Shader {
    private name: string;
    private program: WebGLProgram;
    private gl: WebGL2RenderingContext;

    public constructor(
        name: string,
        gl: WebGL2RenderingContext,
        vertexSource: string,
        fragmentSource: string) {
        this.name = name;
        this.gl = gl;
        this.program = this.gl.createProgram()!;
        const vertexShader = this.loadShader(vertexSource, gl.VERTEX_SHADER);
        const fragmentShader = this.loadShader(fragmentSource, gl.FRAGMENT_SHADER);
        this.createProgram(vertexShader, fragmentShader);
    }

    public getName(): string {
        return this.name;
    }

    public use(): void {
        this.gl.useProgram(this.program);
    }

    // temp
    public getProgram(): WebGLProgram {
        return this.program;
    }

    private loadShader(source: string, shaderType: number): WebGLShader {
        const shader: WebGLShader = this.gl.createShader(shaderType)!;
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        const error = this.gl.getShaderInfoLog(shader);
        if (error !== "") {
            throw new Error("Error compiling shader " + this.name + ":" + error);
        }
        return shader;
    }

    private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader){
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);

        this.gl.linkProgram(this.program);
        const error = this.gl.getProgramInfoLog(this.program);
        if (error !== "") {
            throw new Error("Error linking shader " + this.name + ":" + error);
        }
    }
}