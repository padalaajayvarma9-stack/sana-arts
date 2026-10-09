import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Create S shape with clean geometric slanted edges matching the uploaded logo
const createSShape = () => {
  const shape = new THREE.Shape();
  const s = 0.38; // Exact slant shear factor
  
  const shear = (x: number, y: number): [number, number] => [x + y * s, y];
  
  // 12 CCW vertices outlining the refined S ribbon
  const verts: [number, number][] = [
    [-3.0, -2.8],
    [-0.6, -2.8],
    [-0.6, 0.6],
    [-2.2, 0.6],
    [-2.2, 1.6],
    [-0.6, 1.6],
    [-0.6, 2.8],
    [-3.0, 2.8],
    [-3.0, -0.6],
    [-1.4, -0.6],
    [-1.4, -1.6],
    [-3.0, -1.6]
  ];
  
  const [x0, y0] = shear(verts[0][0], verts[0][1]);
  shape.moveTo(x0, y0);
  for (let i = 1; i < verts.length; i++) {
    const [x, y] = shear(verts[i][0], verts[i][1]);
    shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
};

// Create slanted A shape with and an inner parallel hole
const createAShape = () => {
  const shape = new THREE.Shape();
  const s = 0.38; // Shared shear factor
  
  const shear = (x: number, y: number): [number, number] => [x + y * s, y];
  
  // Outer A silhouette in CCW
  const outerVerts: [number, number][] = [
    [0.6, -2.8],
    [1.4, -2.8],
    [1.4, -0.6],
    [2.2, -0.6],
    [2.2, -2.8],
    [3.0, -2.8],
    [3.0, 2.8],
    [0.6, 2.8]
  ];
  
  const [x0, y0] = shear(outerVerts[0][0], outerVerts[0][1]);
  shape.moveTo(x0, y0);
  for (let i = 1; i < outerVerts.length; i++) {
    const [x, y] = shear(outerVerts[i][0], outerVerts[i][1]);
    shape.lineTo(x, y);
  }
  shape.closePath();
  
  // Inner hole of A in CW to punch a hole
  const innerHole = new THREE.Path();
  const innerVerts: [number, number][] = [
    [1.4, 1.6],
    [2.2, 1.6],
    [2.2, 0.2],
    [1.4, 0.2]
  ];
  
  const [hx0, hy0] = shear(innerVerts[0][0], innerVerts[0][1]);
  innerHole.moveTo(hx0, hy0);
  for (let i = 1; i < innerVerts.length; i++) {
    const [hx, hy] = shear(innerVerts[i][0], innerVerts[i][1]);
    innerHole.lineTo(hx, hy);
  }
  innerHole.closePath();
  shape.holes.push(innerHole);
  
  return shape;
};

// Create the left half of the circular background disk (cut along the slanted axis y * 0.38)
const createLeftDiskShape = () => {
  const shape = new THREE.Shape();
  const s = 0.38;
  const R = 5.2;
  const yTop = R / Math.sqrt(1 + s * s);
  const xTop = yTop * s;
  const angleTop = Math.atan2(yTop, xTop);
  const angleBottom = angleTop - Math.PI;

  shape.moveTo(xTop, yTop);
  shape.absarc(0, 0, R, angleTop, angleBottom, false);
  shape.lineTo(xTop, yTop);
  return shape;
};

// Create the right half of the circular background disk (cut along the slanted axis y * 0.38)
const createRightDiskShape = () => {
  const shape = new THREE.Shape();
  const s = 0.38;
  const R = 5.2;
  const yTop = R / Math.sqrt(1 + s * s);
  const xTop = yTop * s;
  const angleTop = Math.atan2(yTop, xTop);
  const angleBottom = angleTop - Math.PI;

  shape.moveTo(-xTop, -yTop);
  shape.absarc(0, 0, R, angleBottom, angleTop, false);
  shape.lineTo(-xTop, -yTop);
  return shape;
};

// Gold Spark Particles shooting outwards during the split
const Sparks: React.FC<{ splitProgress: number }> = ({ splitProgress }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 180;

  const [positions, initialPositions, data] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const initPos = new Float32Array(count * 3);
    const arr = [];
    for (let i = 0; i < count; i++) {
      const y = (Math.random() - 0.5) * 6;
      const z = (Math.random() - 0.5) * 1.5;
      const x = (Math.random() - 0.5) * 0.2;
      
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      initPos[i * 3] = x;
      initPos[i * 3 + 1] = y;
      initPos[i * 3 + 2] = z;

      arr.push({
        dirX: Math.random() > 0.5 ? 1 : -1,
        speedX: 1.5 + Math.random() * 3.5,
        speedY: (Math.random() - 0.5) * 1.5,
        speedZ: (Math.random() - 0.5) * 1.0,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return [pos, initPos, arr];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const p = data[i];
      const progressFactor = splitProgress;
      
      const initialX = initialPositions[i * 3];
      const initialY = initialPositions[i * 3 + 1];
      const initialZ = initialPositions[i * 3 + 2];

      let x = initialX + p.dirX * progressFactor * p.speedX;
      x += Math.sin(time * 5 + p.phase) * progressFactor * 0.4; // Turbulence

      let y = initialY + progressFactor * p.speedY;
      y += Math.cos(time * 3 + p.phase) * progressFactor * 0.2;

      let z = initialZ + progressFactor * p.speedZ;

      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#f59e0b" // Fiery gold sparks
        transparent
        opacity={splitProgress > 0.05 ? Math.min(splitProgress * 2.0, 1.0) * (1.0 - splitProgress) : 0}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

interface SALogo3DProps {
  scrollFraction: number;
}

export const SALogo3D: React.FC<SALogo3DProps> = ({ scrollFraction }) => {
  const leftGroupRef = useRef<THREE.Group>(null);
  const rightGroupRef = useRef<THREE.Group>(null);
  const coreGroupRef = useRef<THREE.Group>(null);
  const portalLightRef = useRef<THREE.PointLight>(null);
  
  const leftDiskMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const rightDiskMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  // Buffer state to lerp scroll progress for ultra-smooth buttery luxury rendering
  const lerpScrollRef = useRef(0);

  // Extrude settings for massive 3D depth and clean beveled edges
  const extrudeSettingsLetters = {
    depth: 0.8,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.08,
    bevelThickness: 0.1,
  };

  const extrudeSettingsDisk = {
    depth: 0.4,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.06,
    bevelThickness: 0.08,
  };

  const sGeometry = useMemo(() => new THREE.ExtrudeGeometry(createSShape(), extrudeSettingsLetters), []);
  const aGeometry = useMemo(() => new THREE.ExtrudeGeometry(createAShape(), extrudeSettingsLetters), []);
  const leftDiskGeometry = useMemo(() => new THREE.ExtrudeGeometry(createLeftDiskShape(), extrudeSettingsDisk), []);
  const rightDiskGeometry = useMemo(() => new THREE.ExtrudeGeometry(createRightDiskShape(), extrudeSettingsDisk), []);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    // Smoothly interpolate scroll state (GSAP-like lagless easing effect)
    lerpScrollRef.current = THREE.MathUtils.lerp(lerpScrollRef.current, scrollFraction, 0.06);
    const sProgress = lerpScrollRef.current;

    // 1. Core Gentle Hover Float (keeps perfect centering on load)
    if (coreGroupRef.current) {
      coreGroupRef.current.position.y = Math.sin(elapsed * 1.5) * 0.12;
      coreGroupRef.current.position.x = 0;
      coreGroupRef.current.position.z = 0;
      
      // Elegant, lazy continuous orientation rotation
      coreGroupRef.current.rotation.y = Math.sin(elapsed * 0.3) * 0.08;
      coreGroupRef.current.rotation.x = Math.cos(elapsed * 0.2) * 0.04;
    }

    // 2. Beautiful Scroll Splitting logic
    // S splits left, A splits right
    const splitProgress = Math.min(sProgress * 2.2, 1.0);
    
    // Scale split distance based on scrolling depth
    const splitX = splitProgress * 7.5;
    const rotateY = splitProgress * Math.PI * 0.14; 
    const translateZ = -splitProgress * 4.0;

    if (leftGroupRef.current) {
      leftGroupRef.current.position.x = -splitX;
      leftGroupRef.current.position.z = translateZ;
      leftGroupRef.current.rotation.y = -rotateY;
    }

    if (rightGroupRef.current) {
      rightGroupRef.current.position.x = splitX;
      rightGroupRef.current.position.z = translateZ;
      rightGroupRef.current.rotation.y = rotateY;
    }

    // 3. Backlight portal point light activation
    if (portalLightRef.current) {
      portalLightRef.current.intensity = splitProgress * 15.0;
    }

    // 4. Smooth polar white backing disk fade out as scroll fraction deepens
    const diskOpacity = 0.95 * (1.0 - Math.min(sProgress * 2.4, 0.95));
    if (leftDiskMaterialRef.current) {
      leftDiskMaterialRef.current.opacity = diskOpacity;
    }
    if (rightDiskMaterialRef.current) {
      rightDiskMaterialRef.current.opacity = diskOpacity;
    }
  });

  return (
    <group ref={coreGroupRef} scale={[0.38, 0.38, 0.38]}>
      
      {/* Central Expanding Portal Power-Glow */}
      <pointLight
        ref={portalLightRef}
        position={[0, 0, -0.6]}
        distance={15}
        intensity={0}
        color="#fbbf24"
      />

      {/* Sparks bursting from division channel */}
      <Sparks splitProgress={scrollFraction} />

      {/* LEFT HALF (Letter 'S' + Left Backing Half-Disk) */}
      <group ref={leftGroupRef}>
        {/* Letter S - Metal Mirror-Polished Obsidian Chrome Material */}
        <mesh geometry={sGeometry} position={[0, 0, 0.42]}>
          <meshPhysicalMaterial
            color="#18181b"
            roughness={0.06}
            metalness={0.98}
            clearcoat={1.0}
            clearcoatRoughness={0.03}
            reflectivity={1.0}
            emissive="#0d0d0c"
            emissiveIntensity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Left half circular background Polar White Glossy Ceramic Plate */}
        <mesh geometry={leftDiskGeometry} position={[0, 0, 0]}>
          <meshPhysicalMaterial
            ref={leftDiskMaterialRef}
            color="#ffffff"
            roughness={0.12}
            metalness={0.08}
            opacity={0.95}
            transparent
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            reflectivity={0.8}
            emissive="#dddddd"
            emissiveIntensity={0.12}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* RIGHT HALF (Letter 'A' + Right Backing Half-Disk) */}
      <group ref={rightGroupRef}>
        {/* Letter A - Metal Mirror-Polished Obsidian Chrome Material */}
        <mesh geometry={aGeometry} position={[0, 0, 0.42]}>
          <meshPhysicalMaterial
            color="#18181b"
            roughness={0.06}
            metalness={0.98}
            clearcoat={1.0}
            clearcoatRoughness={0.03}
            reflectivity={1.0}
            emissive="#0d0d0c"
            emissiveIntensity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Right half circular background Polar White Glossy Ceramic Plate */}
        <mesh geometry={rightDiskGeometry} position={[0, 0, 0]}>
          <meshPhysicalMaterial
            ref={rightDiskMaterialRef}
            color="#ffffff"
            roughness={0.12}
            metalness={0.08}
            opacity={0.95}
            transparent
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            reflectivity={0.8}
            emissive="#dddddd"
            emissiveIntensity={0.12}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
};
