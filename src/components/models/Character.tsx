import { useGLTF, useAnimations, Text } from "@react-three/drei";
import { useRef, useEffect, useMemo } from "react";
import { Bone, SkinnedMesh, Material, AnimationClip, Group } from "three";
import { GLTF } from "three-stdlib";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";

interface CharacterProps {
  animation: string;
  player_username: string | null;
}

interface GLTFResult extends GLTF {
  nodes: {
    _rootJoint: Bone;
    body: SkinnedMesh;
    eye: SkinnedMesh;
    "hand-": SkinnedMesh;
    leg: SkinnedMesh;
  };
  materials: {
    Material: Material;
  };
  animations: AnimationClip[];
}

export function Character({ animation, player_username }: CharacterProps) {
  const groupRef = useRef<Group | null>(null);
  const previousAnimationRef = useRef<string>("idle"); // Keep track of previous animation
  const { scene, animations: originalAnimations } = useGLTF(
    "./fall_guy.glb"
  ) as GLTFResult;

  // Clone the scene and animations
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const animations = useMemo(() => originalAnimations, [originalAnimations]);

  // Setup animations
  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => {
    // If we have no actions, return early
    if (!actions || Object.keys(actions).length === 0) return;

    // Get current and previous animations
    const current = actions[animation];
    const previous = actions[previousAnimationRef.current];

    if (current) {
      // Fade out previous animation
      if (previous && previous !== current) {
        previous.fadeOut(0.2);
      }

      // Fade in current animation
      current.reset().fadeIn(0.2).play();

      // Update previous animation reference
      previousAnimationRef.current = animation;
    }

    // Cleanup function
    return () => {
      if (current) {
        current.fadeOut(0.2);
      }
    };
  }, [animation, actions]);

  return (
    <group ref={groupRef} scale={0.3}>
      <primitive object={clonedScene} />
      {player_username && (
        <Text
          position={[0, 3, 0]} // Adjust position to be above character
          scale={[1, 1, 1]} // Adjust scale as needed
          color="black" // Text color
          anchorX="center" // Center text horizontally
          anchorY="middle" // Center text vertically
          fontSize={0.5} // Adjust font size
        >
          {player_username}
        </Text>
      )}
    </group>
  );
}
useGLTF.preload("./fall_guy.glb");
