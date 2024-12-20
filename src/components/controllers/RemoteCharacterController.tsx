import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { Character } from "../models/Character";
import usePlayerStore from "@/store/gameStore";
import { useRef, useEffect } from "react";

export function RemoteCharacterController() {
  const { players } = usePlayerStore();
  const rigidBodyRefs = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    Object.keys(rigidBodyRefs.current).forEach((playerId) => {
      if (!players[playerId]) {
        delete rigidBodyRefs.current[playerId];
      }
    });
  }, [players]);

  return (
    <>
      {Object.entries(players).map(([playerId, playerData]) => {
        console.log(playerData.player_rotation);
        return (
          <RigidBody
            key={playerId}
            ref={(ref) => {
              if (ref) {
                if (!rigidBodyRefs.current[playerId]) {
                  rigidBodyRefs.current[playerId] = {};
                }
                rigidBodyRefs.current[playerId].ref = ref;
              }
            }}
            type="kinematicPosition"
            colliders={false}
            position={[
              playerData.player_position.x,
              playerData.player_position.y,
              playerData.player_position.z,
            ]}
            rotation={[0, playerData.player_rotation, 0]}
          >
            {/* Add a container group to handle model positioning */}
            <group position={[0, 0.5, 0]}>
              {/* Add another group for model adjustments if needed */}
              <group
                position={[0, 0, 0]}
                rotation={[0, 0, 0]}
                scale={1} // Adjust if needed
              >
                <Character
                  animation={playerData.animation || "idle"}
                  player_username={playerData.player_username}
                />
              </group>
            </group>
            <CapsuleCollider args={[0.2, 0.25]} position={[0, 0.9, 0]} />
          </RigidBody>
        );
      })}
    </>
  );
}
