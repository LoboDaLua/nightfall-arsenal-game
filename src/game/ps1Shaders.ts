import * as THREE from 'three';

/**
 * Applies authentic PS1-era vertex snapping ("PS1 distorção") to any Three.js
 * MeshStandardMaterial or MeshLambertMaterial via onBeforeCompile while preserving
 * full PBR lighting, shadows, environment reflections, and fog.
 */
export function applyPS1VertexSnap<T extends THREE.Material>(
  material: T,
  snapResolution = 170
): T {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uPs1Snap = { value: new THREE.Vector2(snapResolution, snapResolution * 0.75) };

    shader.vertexShader = `uniform vec2 uPs1Snap;\n` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>',
      `
      #include <project_vertex>
      if (gl_Position.w > 0.25) {
        vec4 ps1Snapped = gl_Position;
        ps1Snapped.xyz = gl_Position.xyz / gl_Position.w;
        ps1Snapped.x = floor(uPs1Snap.x * ps1Snapped.x + 0.5) / uPs1Snap.x;
        ps1Snapped.y = floor(uPs1Snap.y * ps1Snapped.y + 0.5) / uPs1Snap.y;
        ps1Snapped.xyz *= gl_Position.w;
        gl_Position = ps1Snapped;
      }
      `
    );
  };
  material.customProgramCacheKey = () => `ps1_snap_${snapResolution}`;
  return material;
}
