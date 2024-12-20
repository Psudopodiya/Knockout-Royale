import {
  CapsuleCollider,
  RigidBody,
  RapierRigidBody,
} from "@react-three/rapier";
import { Character } from "../models/Character";
import usePlayerStore from "@/store/gameStore";
import { useControls } from "leva";
import { Vector3, Group } from "three";
import { degToRad, MathUtils } from "three/src/math/MathUtils.js";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { lerpAngle } from "@/utils/cameraUtils";
import { useKeyboardControls } from "@react-three/drei";

interface UpdateThresholds {
  position: number;
  rotation: number;
}

export function Character_Controller() {
  const { local_player_data, wsConnection } = usePlayerStore();
  const { WALK_SPEED, RUN_SPEED, ROTATION_SPEED, CAMERA_Y, CAMERA_Z } =
    useControls("Character Control", {
      WALK_SPEED: { value: 0.8, min: 0.1, max: 4, step: 0.1 },
      POSITION_Y: { value: 10, min: -20, max: 20, step: 0.2 },
      RUN_SPEED: { value: 1.6, min: 0.2, max: 12, step: 0.1 },
      CAMERA_Y: { value: 4, min: -20, max: 20, step: 0.2 },
      CAMERA_Z: { value: -10, min: -20, max: 0, step: 0.2 },
      JUMP_FORCE: { value: 5, min: 1, max: 10, step: 0.1 }, // Add jump force control
      ROTATION_SPEED: {
        value: degToRad(0.5),
        min: degToRad(0.1),
        max: degToRad(5),
        step: degToRad(0.1),
      },
    });

  const rb = useRef<RapierRigidBody>(null);
  const characterRotationTarget = useRef(0);
  const rotationTarget = useRef(0);
  const container = useRef<Group | null>(null);
  const character = useRef<Group | null>(null);
  const cameraTarget = useRef<Group | null>(null);
  const cameraPosition = useRef<Group | null>(null);
  const [animation, setAnimation] = useState("idle");

  const cameraWorldPosition = useRef(new Vector3());
  const cameraLookAtWorldPosition = useRef(new Vector3());
  const cameraLookAt = useRef(new Vector3());

  // Refs for movement update optimization
  const lastSentPosition = useRef(new Vector3());
  const lastSentRotation = useRef(0);
  const lastSentAnimation = useRef("idle");

  // Movement update thresholds
  const THRESHOLDS: Record<string, UpdateThresholds> = {
    idle: {
      position: 0.1,
      rotation: 0.1,
    },
    walk: {
      position: 0.05,
      rotation: 0.05,
    },
    run: {
      position: 0.02,
      rotation: 0.02,
    },
  };

  const [, get] = useKeyboardControls();
  useFrame((state) => {
    if (rb.current) {
      const linvel = rb.current.linvel();
      const vel = { x: linvel.x, y: linvel.y, z: linvel.z };
      const movement = {
        x: 0,
        z: 0,
      };
      if (get().forward) movement.z += 1;
      if (get().backward) movement.z -= 1;
      if (get().leftward) movement.x += 1;
      if (get().rightward) movement.x -= 1;

      const speed = get().run ? RUN_SPEED : WALK_SPEED;

      if (movement.x !== 0) {
        rotationTarget.current += ROTATION_SPEED * movement.x;
      }
      if (movement.x !== 0 || movement.z !== 0) {
        characterRotationTarget.current = Math.atan2(movement.x, movement.z);
        vel.x =
          Math.sin(rotationTarget.current) * speed * (movement.z < 0 ? -1 : 1);
        vel.z =
          Math.cos(rotationTarget.current) * speed * (movement.z < 0 ? -1 : 1);
        if (speed === RUN_SPEED) {
          setAnimation("run");
        } else if (speed === WALK_SPEED) {
          setAnimation("walk");
        }
      } else {
        setAnimation("idle");
      }
      if (character.current) {
        character.current.rotation.y = lerpAngle(
          character.current.rotation.y,
          characterRotationTarget.current,
          0.1
        );
      }

      rb.current.setLinvel(vel, true);

      // Send updates to other players through WebSocket
      if (wsConnection && container.current) {
        const currentPosition = rb.current.translation();
        const currentRotation = container.current.rotation.y;

        // Get appropriate thresholds based on current animation
        const thresholds = THRESHOLDS[animation] || THRESHOLDS.idle;
        // Calculate position difference
        const positionDifference = new Vector3(
          currentPosition.x,
          currentPosition.y,
          currentPosition.z
        ).distanceTo(lastSentPosition.current);

        // Calculate rotation difference
        const rotationDifference = Math.abs(
          currentRotation - lastSentRotation.current
        );

        // Check for significant changes
        const hasSignificantPositionChange =
          positionDifference > thresholds.position;
        const hasSignificantRotationChange =
          rotationDifference > thresholds.rotation;
        const hasAnimationChange = animation !== lastSentAnimation.current;
        if (
          hasSignificantPositionChange ||
          hasSignificantRotationChange ||
          hasAnimationChange
        ) {
          // Send update through websocket
          wsConnection.sendPosition(
            new Vector3(
              currentPosition.x,
              currentPosition.y,
              currentPosition.z
            ),
            currentRotation,
            animation
          );

          // Update last sent values
          lastSentPosition.current.set(
            currentPosition.x,
            currentPosition.y,
            currentPosition.z
          );
          lastSentRotation.current = currentRotation;
          lastSentAnimation.current = animation;
        }
      }
    }

    // CAMERA CONTROLS
    if (
      !cameraPosition.current ||
      !cameraTarget.current ||
      !cameraWorldPosition.current ||
      !cameraLookAtWorldPosition.current ||
      !cameraLookAt.current ||
      !container.current
    ) {
      return;
    }

    container.current.rotation.y = MathUtils.lerp(
      container.current.rotation.y,
      rotationTarget.current,
      0.1
    );
    cameraPosition.current.getWorldPosition(cameraWorldPosition.current);
    state.camera.position.lerp(cameraWorldPosition.current, 0.1);

    if (cameraTarget.current) {
      cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current);
      cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, 0.1);

      state.camera.lookAt(cameraLookAt.current);
    }
  });
  return (
    <>
      <RigidBody
        colliders={false}
        lockRotations
        ref={rb}
        position={[
          local_player_data?.player_position.x,
          local_player_data?.player_position.y,
          local_player_data?.player_position.z,
        ]}
      >
        <group ref={container}>
          <group ref={cameraTarget} position-z={1.5} />
          <group
            ref={cameraPosition}
            position-y={CAMERA_Y}
            position-z={CAMERA_Z}
          />
          <group ref={character} position-y={0.5}>
            <Character animation={animation} player_username={"me"} />
          </group>
        </group>
        <CapsuleCollider
          args={[0.2, 0.25]} // Adjusted height and radius
          position={[0, 0.9, 0]}
        />
      </RigidBody>
    </>
  );
}
