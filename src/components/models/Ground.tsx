import { RigidBody } from "@react-three/rapier";
import { Html, Plane } from "@react-three/drei";

type Props = {
  position: [number, number, number];
  dimensions: [number, number, number];
  name: string;
};
export function Ground({ position, dimensions, name }: Props) {
  return (
    <RigidBody
      type="fixed"
      position={position}
      colliders="cuboid"
      restitution={0.9}
    >
      <Plane receiveShadow>
        <boxGeometry args={dimensions} />
        <meshStandardMaterial color="#40E0D0" roughness={2} />
        <Html>
          <div>{name}</div>
        </Html>
      </Plane>
    </RigidBody>
  );
}
