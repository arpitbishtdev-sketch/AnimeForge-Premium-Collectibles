import { Canvas } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";

function Model({ url }) {
  const { scene } = useGLTF(url);
  const ref = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = Math.sin(t * 0.4) * 0.25;
  });

  return <primitive ref={ref} object={scene} scale={2.2} />;
}

export default function Hero3DModel({ modelUrl }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 35 }}
      style={{ width: "100%", height: "80vh" }}
    >
      <ambientLight intensity={1} />
      <directionalLight position={[3, 5, 3]} intensity={2} />

      <Suspense fallback={null}>
        <Model url={modelUrl} />
        <Environment preset="studio" />
      </Suspense>
    </Canvas>
  );
}
