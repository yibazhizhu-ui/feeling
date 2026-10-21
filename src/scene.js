// Deform palms and water independently at 12 fps, with slow, visible swaying.
// The underlying <img> remains visible if WebGL is unavailable.
export function createShoreScene(canvas, reducedMotion) {
  let gl;
  try { gl = canvas.getContext('webgl', { alpha: false, antialias: false }); } catch { return { start() {}, stop() {} }; }
  if (!gl || reducedMotion) return { start() {}, stop() {} };
  const vertex = `attribute vec2 a_position; varying vec2 v_uv;
    void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;
  const fragment = `precision mediump float;
    uniform sampler2D u_image;uniform float u_time;uniform vec2 u_cover;varying vec2 v_uv;
    void main(){
      vec2 uv=vec2(v_uv.x,1.-v_uv.y);
      uv=(uv-.5)*u_cover+.5;
      float palms=1.-smoothstep(.53,.78,uv.y);
      float sea=smoothstep(.74,.84,uv.y);
      const float palmStrength=2.4;
      const float waveStrength=1.8;
      uv.x+=palms*palmStrength*(sin(u_time*.65+uv.y*6.)*.0035+sin(u_time*.93+uv.x*8.)*.0014);
      uv.y+=palms*palmStrength*sin(u_time*.74+uv.x*9.)*.0014;
      uv.y+=sea*waveStrength*sin(uv.y*100.-u_time*1.5+uv.x*5.)*.0018;
      uv.x+=sea*waveStrength*sin(uv.y*65.-u_time*.9)*.0013;
      vec3 color=texture2D(u_image,clamp(uv,.002,.998)).rgb;
      float light=exp(-pow((uv.y-.65)*7.,2.))*(.012+.012*sin(u_time*.7+uv.x*4.));
      color+=vec3(1.,.78,.4)*light;
      gl_FragColor=vec4(color,1.);
    }`;
  function shader(type, source) {
    const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error('Shader unavailable');
    return s;
  }
  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error('WebGL unavailable');
  } catch { return { start() {}, stop() {} }; }
  gl.useProgram(program);
  const buffer = gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const time = gl.getUniformLocation(program, 'u_time');
  const cover = gl.getUniformLocation(program, 'u_cover');
  const photo = new Image();
  let loaded = false, active = false, frame = 0, last = 0;
  function draw(now) {
    if (!active) return;
    frame = requestAnimationFrame(draw);
    if (!loaded || document.hidden || now - last < 1000 / 12) return;
    last = now;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width;canvas.height = height;gl.viewport(0,0,width,height); }
    const ratio = width / height, photoRatio = photo.width / photo.height;
    gl.uniform2f(cover, Math.min(1, ratio / photoRatio), Math.min(1, photoRatio / ratio));
    gl.uniform1f(time, now / 1000);gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  photo.onload = () => {
    const texture = gl.createTexture();gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,photo);
    loaded = true;canvas.classList.add('ready');
  };
  photo.src = new URL('../assets/shore.jpg', import.meta.url).href;
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault();active = false;cancelAnimationFrame(frame);canvas.classList.remove('ready'); });
  return { start() { if (!active) { active = true;frame = requestAnimationFrame(draw); } }, stop() { active = false;cancelAnimationFrame(frame); } };
}
