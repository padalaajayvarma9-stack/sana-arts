import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { SALogo3D } from './SALOGO3D';

// Scene Controller matching camera position to scrollFraction
interface SceneControllerProps {
  scrollFraction: number;
}

const SceneController: React.FC<SceneControllerProps> = ({ scrollFraction }) => {
  const { camera } = useThree();

  useFrame(() => {
    // Elegant transition of camera through the tunnel
    // scrollFraction 0.0: z = 5.3, y = 0, lookAt = (0, 0, 0)
    // scrollFraction 1.0: z = -5.0, y = -0.5, lookAt slides downward
    const targetZ = 5.3 - scrollFraction * 14.5;
    const targetY = -scrollFraction * 1.5;
    const targetX = Math.sin(scrollFraction * Math.PI) * 0.6; // Slight cinematic swoop left-right

    // Extremely smooth interpolation tracking (lerp over physics frames)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);

    // Dynamic camera lookup target so we are looking slightly downward as we submerge
    const lookAtTarget = new THREE.Vector3(0, -scrollFraction * 1.2, -scrollFraction * 5.0);
    camera.lookAt(lookAtTarget);
  });

  return null;
};

// Dynamic atmospheric lighting and sky sphere representation
const StudioEnvironment: React.FC = () => {
  return (
    <group>
      {/* Soft Ambient Fill */}
      <ambientLight intensity={0.4} />

      {/* Primary Key Spotlight focused on logo centered */}
      <spotLight
        position={[4, 5, 6]}
        angle={0.4}
        penumbra={0.8}
        intensity={2.5}
        castShadow
        color="#ffffff"
      />

      {/* Dramatic blue/silver rim light from underneath */}
      <pointLight position={[-4, -3, -2]} intensity={1.5} color="#e0f2fe" />

      {/* Glowing luxury backdrop light */}
      <directionalLight position={[0, -2, -5]} intensity={1.2} color="#ffffff" />
      
      {/* Procedural High-Gloss reflective surroundings (Giant metallic/dark sky sphere) */}
      <mesh scale={22}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#050505"
          side={THREE.BackSide}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
};

interface ThreeCanvasProps {
  scrollFraction: number;
}

class ThreeErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("WebGL/Canvas rendering error captured gracefully by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 bg-[#020202] bg-[radial-gradient(ellipse_at_center,rgba(40,40,60,0.3)_0%,rgba(2,2,2,1)_70%)] flex items-center justify-center text-white/40 text-xs tracking-widest uppercase font-mono select-none">
          <span>SANA ARTS EXHIBIT &bull; 2D AMBIENT BACKDROP MODE</span>
        </div>
      );
    }
    return this.props.children;
  }
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ scrollFraction }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-screen z-0 bg-[#020202]">
      <ThreeErrorBoundary>
        <Canvas
          gl={{ antialias: true, alpha: false, stencil: false, depth: true }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault fov={55} position={[0, 0, 5.3]} near={0.1} far={30} />
            
            {/* Dynamic Studio Lights & Environment */}
            <StudioEnvironment />

            {/* Central Transformational logo - splitting in 3D */}
            <SALogo3D scrollFraction={scrollFraction} />

            {/* Controls the camera travel depth smoothly tied to scrolling */}
            <SceneController scrollFraction={scrollFraction} />
          </Suspense>
        </Canvas>
      </ThreeErrorBoundary>
    </div>
  );
};
