export const getGLContext = ( canvas: HTMLCanvasElement ): WebGL2RenderingContext => {

    const gl = canvas.getContext('webgl2');
    if ( gl === null ) {
        throw new Error("Unable to initialize WebGl");
    }

    return gl;
}