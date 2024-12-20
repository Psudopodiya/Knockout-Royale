import { RigidBody } from "@react-three/rapier";
import { Edges, Plane } from "@react-three/drei";

type Props = {
  position: [number, number, number];
  dimensions: [number, number, number];
};

export function Ground({ position, dimensions }: Props) {
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
        <Edges />
      </Plane>
    </RigidBody>
  );
}
