import { Ground } from "@/components/models/Ground";
import { Character_Controller } from "@/components/controllers/Character_Controller";
import { RemoteCharacterController } from "@/components/controllers/RemoteCharacterController";
import {
  Environment,
  OrbitControls,
  OrthographicCamera,
} from "@react-three/drei";
import { useRef } from "react";
import { Physics } from "@react-three/rapier";
import { OrthographicCamera as ThreeOrthographicCamera } from "three";

export function Experience() {
  const shadowCameraRef = useRef<ThreeOrthographicCamera>(null);
  return (
    <>
      <OrbitControls />
      <Environment preset="sunset" />
      <directionalLight
        intensity={0.65}
        castShadow
        position={[-15, 10, 15]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00005}
      >
        <OrthographicCamera
          left={-22}
          right={15}
          top={10}
          bottom={-20}
          ref={shadowCameraRef}
          attach={"shadow-camera"}
        />
      </directionalLight>
      <Physics debug>
        <Ground position={[0, -2, 0]} dimensions={[10, 0.5, 20]} />
        <Ground position={[10, -2, 0]} dimensions={[10, 0.5, 20]} />
        <Character_Controller />
        <RemoteCharacterController />
      </Physics>
    </>
  );
}
