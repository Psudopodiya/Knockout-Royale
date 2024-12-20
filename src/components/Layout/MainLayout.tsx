import { Canvas } from "@react-three/fiber";
import { Experience } from "@/components/scene/Experience";
import { KeyboardControls } from "@react-three/drei";
import { keyboardMap } from "@/utils/keyboardMap";
import { Leva } from "leva";

export function MainLayout() {
  return (
    <KeyboardControls map={keyboardMap}>
      <Leva hidden />
      <Canvas
        shadows
        camera={{ position: [3, 3, 3], near: 0.1, fov: 40 }}
        style={{
          touchAction: "none",
        }}
      >
        <color attach="background" args={["#ececec"]} />
        <directionalLight
          intensity={0.65}
          castShadow
          position={[-15, 10, 15]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
        <Experience />
      </Canvas>
    </KeyboardControls>
  );
}
