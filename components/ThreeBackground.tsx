import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    // Solarized Dark Base03 (#002b36) for fog
    scene.fog = new THREE.FogExp2(0x002b36, 0.002);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // --- PARTICLE TEXTURE GENERATION ---
    const getParticleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        // Solarized Light Base3 (#fdf6e3) for particle core
        grad.addColorStop(0, 'rgba(253, 246, 227, 1)');
        grad.addColorStop(0.4, 'rgba(253, 246, 227, 0.5)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 32, 32);
      }
      return new THREE.CanvasTexture(canvas);
    };

    // --- MAIN PARTICLES ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1500;
    const posArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);

    // Solarized Accents
    const color1 = new THREE.Color(0x2aa198); // Cyan
    const color2 = new THREE.Color(0xd33682); // Magenta
    const color3 = new THREE.Color(0xfdf6e3); // Solarized Light Base3

    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 180;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 120;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 120;

      const r = Math.random();
      const mixedColor = r > 0.6 ? color1 : r > 0.3 ? color2 : color3;
      
      colorArray[i * 3] = mixedColor.r;
      colorArray[i * 3 + 1] = mixedColor.g;
      colorArray[i * 3 + 2] = mixedColor.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.4,
      map: getParticleTexture(),
      transparent: true,
      vertexColors: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // --- NETWORK LINES ---
    const linesMaterial = new THREE.LineBasicMaterial({
      color: 0x93a1a1, // Solarized Base1
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
    });
    
    const linesGeometry = new THREE.BufferGeometry();
    const linePoints: number[] = [];
    
    // Create random static connections
    for (let i = 0; i < 300; i++) {
      const x = (Math.random() - 0.5) * 150;
      const y = (Math.random() - 0.5) * 150;
      const z = (Math.random() - 0.5) * 100;
      
      linePoints.push(x, y, z);
      linePoints.push(
        x + (Math.random() - 0.5) * 25, 
        y + (Math.random() - 0.5) * 25, 
        z + (Math.random() - 0.5) * 25
      );
    }
    
    linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePoints, 3));
    const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(linesMesh);

    // --- SPARKS SYSTEM (Center Emitters) ---
    const sparkCount = 100;
    const sparkGeometry = new THREE.BufferGeometry();
    const sPos = new Float32Array(sparkCount * 3);
    const sColor = new Float32Array(sparkCount * 3);
    
    const sVelocities: {x: number, y: number, z: number}[] = [];
    const sBaseColors: {r: number, g: number, b: number}[] = [];
    const sLifes = new Float32Array(sparkCount); // 0 (dead) to 1 (full life)

    const sparkPalette = [
      new THREE.Color(0x2aa198), // Cyan
      new THREE.Color(0xcb4b16), // Orange
      new THREE.Color(0xb58900), // Yellow
      new THREE.Color(0xd33682)  // Magenta
    ];

    for(let i = 0; i < sparkCount; i++) {
      sPos[i*3] = 0; sPos[i*3+1] = 0; sPos[i*3+2] = 0;
      sColor[i*3] = 0; sColor[i*3+1] = 0; sColor[i*3+2] = 0; // Invisible initially
      sLifes[i] = 0;
      sVelocities.push({x:0, y:0, z:0});
      sBaseColors.push({r:1, g:1, b:1});
    }

    sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    sparkGeometry.setAttribute('color', new THREE.BufferAttribute(sColor, 3));

    const sparkMaterial = new THREE.PointsMaterial({
      size: 2.0, // Slightly larger
      map: getParticleTexture(),
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 1.0 
    });

    const sparksMesh = new THREE.Points(sparkGeometry, sparkMaterial);
    scene.add(sparksMesh);

    // --- FLOATING SHAPES (Interactive Artifacts) ---
    const shapesGroup = new THREE.Group();
    scene.add(shapesGroup);
    
    // Reusable geometries
    const geometries = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(1, 0),
    ];

    const shapesData: {
      mesh: THREE.Mesh;
      rotSpeedX: number;
      rotSpeedY: number;
      floatSpeed: number;
      floatOffset: number;
      initialY: number;
    }[] = [];

    // Create 15 floating wireframe shapes
    for (let i = 0; i < 15; i++) {
      const geom = geometries[Math.floor(Math.random() * geometries.length)];
      const material = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0x268bd2 : 0x6c71c4, // Solarized Blue or Violet
        wireframe: true,
        transparent: true,
        opacity: 0.03 + Math.random() * 0.05,
        blending: THREE.AdditiveBlending,
      });
      
      const mesh = new THREE.Mesh(geom, material);
      
      // Random scale
      const scale = Math.random() * 5 + 3;
      mesh.scale.set(scale, scale, scale);
      
      // Random position distributed in background
      const x = (Math.random() - 0.5) * 180;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 80 - 10;
      
      mesh.position.set(x, y, z);

      shapesGroup.add(mesh);
      
      shapesData.push({
        mesh,
        rotSpeedX: (Math.random() - 0.5) * 0.01,
        rotSpeedY: (Math.random() - 0.5) * 0.01,
        floatSpeed: Math.random() * 0.5 + 0.2,
        floatOffset: Math.random() * Math.PI * 2,
        initialY: y
      });
    }

    // --- SHOOTING STAR (Data Stream Effect) ---
    const starGeometry = new THREE.BufferGeometry();
    const starPos = new Float32Array(6); // 2 points * 3 coords
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMaterial = new THREE.LineBasicMaterial({ 
      color: 0xfdf6e3, // Solarized Light Base3
      transparent: true, 
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const starLine = new THREE.Line(starGeometry, starMaterial);
    scene.add(starLine);

    let starActive = false;
    let starProgress = 0;
    let starSpeed = 0;
    const starStart = new THREE.Vector3();
    const starEnd = new THREE.Vector3();

    // --- MOUSE INTERACTION STATE ---
    let mouseX = 0;
    let mouseY = 0;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - windowHalfX);
      mouseY = (event.clientY - windowHalfY);
    };

    document.addEventListener('mousemove', onDocumentMouseMove);

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Mouse Speed Calculation for Sparks
      const mouseSpeed = Math.sqrt(Math.pow(mouseX - prevMouseX, 2) + Math.pow(mouseY - prevMouseY, 2));
      prevMouseX = mouseX;
      prevMouseY = mouseY;

      // --- SPARKS LOGIC ---
      let spawnCount = 0;
      // Random occasional pulse
      if (Math.random() < 0.03) spawnCount = 1;
      // Mouse movement trigger
      if (mouseSpeed > 3) spawnCount += Math.min(Math.floor(mouseSpeed / 5), 3);

      let spawned = 0;
      for(let i = 0; i < sparkCount; i++) {
        if (spawned >= spawnCount) break;
        
        // Find dead particle
        if (sLifes[i] <= 0) {
           sLifes[i] = 1.0;
           // Reset to center area with slight spread
           sPos[i*3] = (Math.random() - 0.5) * 5;
           sPos[i*3+1] = (Math.random() - 0.5) * 5;
           sPos[i*3+2] = (Math.random() - 0.5) * 2;
           
           // Random Velocity outward from center
           const theta = Math.random() * Math.PI * 2;
           const phi = Math.random() * Math.PI;
           const speed = 0.1 + Math.random() * 0.4;
           
           sVelocities[i].x = speed * Math.sin(phi) * Math.cos(theta);
           sVelocities[i].y = speed * Math.sin(phi) * Math.sin(theta);
           sVelocities[i].z = speed * Math.cos(phi);

           // Pick random palette color
           const col = sparkPalette[Math.floor(Math.random() * sparkPalette.length)];
           sBaseColors[i].r = col.r;
           sBaseColors[i].g = col.g;
           sBaseColors[i].b = col.b;
           
           spawned++;
        }
      }

      // Update Spark Physics & Color
      const posAttr = sparkGeometry.attributes.position as THREE.BufferAttribute;
      const colAttr = sparkGeometry.attributes.color as THREE.BufferAttribute;

      for(let i = 0; i < sparkCount; i++) {
         if (sLifes[i] > 0) {
            sPos[i*3] += sVelocities[i].x;
            sPos[i*3+1] += sVelocities[i].y;
            sPos[i*3+2] += sVelocities[i].z;
            
            sLifes[i] -= 0.015; // Decay rate
            
            // Fade out using additive blending (black = invisible)
            const intensity = sLifes[i];
            sColor[i*3] = sBaseColors[i].r * intensity;
            sColor[i*3+1] = sBaseColors[i].g * intensity;
            sColor[i*3+2] = sBaseColors[i].b * intensity;

            if (sLifes[i] < 0) sLifes[i] = 0;
         } else {
            // Ensure fully invisible
            sColor[i*3] = 0; sColor[i*3+1] = 0; sColor[i*3+2] = 0;
         }
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;


      // Mouse Parallax
      targetRotationY = mouseX * 0.0002; 
      targetRotationX = mouseY * 0.0002;

      // Smooth camera interpolation
      const smoothTime = 0.05;
      particlesMesh.rotation.y += smoothTime * (targetRotationY - particlesMesh.rotation.y);
      particlesMesh.rotation.x += smoothTime * (targetRotationX - particlesMesh.rotation.x);
      
      linesMesh.rotation.y += smoothTime * (targetRotationY - linesMesh.rotation.y);
      linesMesh.rotation.x += smoothTime * (targetRotationX - linesMesh.rotation.x);
      
      // Floating shapes move slightly faster for depth perception
      shapesGroup.rotation.y += smoothTime * (targetRotationY - shapesGroup.rotation.y) * 1.5;
      shapesGroup.rotation.x += smoothTime * (targetRotationX - shapesGroup.rotation.x) * 1.5;

      // Apply some rotation to sparks group too
      sparksMesh.rotation.y += smoothTime * (targetRotationY - sparksMesh.rotation.y) * 0.5;
      sparksMesh.rotation.x += smoothTime * (targetRotationX - sparksMesh.rotation.x) * 0.5;


      // Constant ambient rotation
      particlesMesh.rotation.z = elapsedTime * 0.01;
      linesMesh.rotation.z = elapsedTime * 0.008;

      // Animate Floating Shapes (Bobbing and Rotating)
      shapesData.forEach((data) => {
        data.mesh.rotation.x += data.rotSpeedX;
        data.mesh.rotation.y += data.rotSpeedY;
        data.mesh.position.y = data.initialY + Math.sin(elapsedTime * data.floatSpeed + data.floatOffset) * 2;
      });

      // Animate Shooting Star
      if (!starActive) {
        if (Math.random() < 0.005) { // 0.5% chance per frame to spawn
           starActive = true;
           starProgress = 0;
           starSpeed = 0.01 + Math.random() * 0.02;
           starMaterial.opacity = 0;

           // Random start position
           const sx = (Math.random() - 0.5) * 200;
           const sy = (Math.random() - 0.5) * 100;
           const sz = (Math.random() - 0.5) * 100;
           starStart.set(sx, sy, sz);

           // Random end position (direction)
           starEnd.set(
             sx + (Math.random() - 0.5) * 100, 
             sy + (Math.random() - 0.5) * 100, 
             sz + (Math.random() - 0.5) * 100
           );
        }
      } else {
        starProgress += starSpeed;
        
        // Calculate head and tail of the streak
        const head = new THREE.Vector3().lerpVectors(starStart, starEnd, starProgress);
        const tail = new THREE.Vector3().lerpVectors(starStart, starEnd, Math.max(0, starProgress - 0.15));
        
        const posAttr = starLine.geometry.attributes.position as THREE.BufferAttribute;
        posAttr.setXYZ(0, head.x, head.y, head.z);
        posAttr.setXYZ(1, tail.x, tail.y, tail.z);
        posAttr.needsUpdate = true;

        // Fade in and out
        if (starProgress < 0.2) {
          starMaterial.opacity = starProgress * 5; // Fade in
        } else if (starProgress > 0.8) {
          starMaterial.opacity = (1 - starProgress) * 5; // Fade out
        }

        if (starProgress >= 1) {
          starActive = false;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Memory Cleanup
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      linesGeometry.dispose();
      linesMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      sparkGeometry.dispose();
      sparkMaterial.dispose();
      geometries.forEach(g => g.dispose());
      shapesGroup.children.forEach((c: any) => {
         if(c.geometry) c.geometry.dispose();
         if(c.material) c.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="fixed top-0 left-0 w-full h-full -z-10 bg-gradient-to-b from-[#002b36] via-[#073642] to-[#002b36]"
    />
  );
};

export default ThreeBackground;