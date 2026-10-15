(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const container = document.getElementById('threejs-container-ANIMATION_3');
  if (!container || !window.THREE) return;

  const THREE = window.THREE;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  } catch (error) {
    console.warn('The animated background is unavailable because WebGL could not start.', error);
    return;
  }
  const particleCount = 75;
  const maxLineSegments = particleCount * 6;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];

  for (let i = 0; i < particleCount; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 36;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
    velocities.push({
      x: (Math.random() - 0.5) * 0.015,
      y: (Math.random() - 0.5) * 0.015,
      z: (Math.random() - 0.5) * 0.01,
    });
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.35,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(particles);

  const linePositions = new Float32Array(maxLineSegments * 6);
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  scene.add(new THREE.LineSegments(
    lineGeometry,
    new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
    }),
  ));

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  camera.position.z = 24;

  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;
  let frameId = 0;

  function resize() {
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 650;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function onPointerMove(event) {
    pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
  }

  function animate() {
    frameId = window.requestAnimationFrame(animate);
    targetX += (pointerX - targetX) * 0.05;
    targetY += (pointerY - targetY) * 0.05;
    scene.rotation.y = targetX * 0.25;
    scene.rotation.x = targetY * 0.25;

    const pointPositions = geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i += 1) {
      const offset = i * 3;
      pointPositions[offset] += velocities[i].x;
      pointPositions[offset + 1] += velocities[i].y;
      pointPositions[offset + 2] += velocities[i].z;
      if (Math.abs(pointPositions[offset]) > 18) velocities[i].x *= -1;
      if (Math.abs(pointPositions[offset + 1]) > 12) velocities[i].y *= -1;
      if (Math.abs(pointPositions[offset + 2]) > 9) velocities[i].z *= -1;
    }
    geometry.attributes.position.needsUpdate = true;

    const lineArray = lineGeometry.attributes.position.array;
    let lineCount = 0;
    for (let i = 0; i < particleCount; i += 1) {
      for (let j = i + 1; j < particleCount; j += 1) {
        const a = i * 3;
        const b = j * 3;
        const dx = pointPositions[a] - pointPositions[b];
        const dy = pointPositions[a + 1] - pointPositions[b + 1];
        const dz = pointPositions[a + 2] - pointPositions[b + 2];
        if (dx * dx + dy * dy + dz * dz >= 5.5 * 5.5 || lineCount >= maxLineSegments) continue;

        const lineOffset = lineCount * 6;
        lineArray[lineOffset] = pointPositions[a];
        lineArray[lineOffset + 1] = pointPositions[a + 1];
        lineArray[lineOffset + 2] = pointPositions[a + 2];
        lineArray[lineOffset + 3] = pointPositions[b];
        lineArray[lineOffset + 4] = pointPositions[b + 1];
        lineArray[lineOffset + 5] = pointPositions[b + 2];
        lineCount += 1;
      }
    }
    lineGeometry.setDrawRange(0, lineCount * 2);
    lineGeometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  }

  resize();
  window.addEventListener('resize', resize);
  if (!prefersReducedMotion) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    animate();
  } else {
    renderer.render(scene, camera);
  }

  window.addEventListener('pagehide', () => {
    window.cancelAnimationFrame(frameId);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onPointerMove);
    geometry.dispose();
    lineGeometry.dispose();
    renderer.dispose();
  }, { once: true });
})();
