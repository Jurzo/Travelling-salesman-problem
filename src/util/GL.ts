export const getGLContext = ( canvas: HTMLCanvasElement ): WebGL2RenderingContext => {

    const gl = canvas.getContext('webgl2', { premultipliedAlpha: true });
    if ( gl === null ) {
        throw new Error("Unable to initialize WebGl");
    }

    return gl;
}