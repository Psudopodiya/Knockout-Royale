import { Ground } from "@/components/models/Ground";
// import { platforms } from "@/utils/mapSetup";
import { useControls, folder } from "leva";

export function Map() {
  const platformControls = useControls("Platforms", {
    Base: folder({
      position: folder({
        base_p_x: { value: 0, min: -100, max: 100 },
        base_p_y: { value: -2, min: -100, max: 100 },
        base_p_z: { value: 0, min: -100, max: 100 },
      }),
      dimensions: folder({
        base_d_x: { value: 10, min: 0, max: 20 },
        base_d_y: { value: 0.5, min: 0, max: 2 },
        base_d_z: { value: 20, min: 0, max: 40 },
      }),
      base_name: "Base",
    }),
    Platform1: folder({
      position: folder({
        p1_p_x: { value: -5, min: -100, max: 100 },
        p1_p_y: { value: -0, min: -100, max: 100 },
        p1_p_z: { value: -12, min: -100, max: 100 },
      }),
      dimensions: folder({
        p1_d_x: { value: 10, min: 0, max: 20 },
        p1_d_y: { value: 0.5, min: 0, max: 2 },
        p1_d_z: { value: 20, min: 0, max: 40 },
      }),
      p1_name: "Platform1",
    }),
  });
  console.log(platformControls);
  return (
    <>
      <Ground
        position={[
          platformControls.base_p_x,
          platformControls.base_p_y,
          platformControls.base_p_z,
        ]}
        dimensions={[
          platformControls.base_d_x,
          platformControls.base_d_y,
          platformControls.base_d_z,
        ]}
        name={platformControls.base_name}
      />
      <Ground
        position={[
          platformControls.p1_p_x,
          platformControls.p1_p_y,
          platformControls.p1_p_z,
        ]}
        dimensions={[
          platformControls.p1_d_x,
          platformControls.p1_d_y,
          platformControls.p1_d_z,
        ]}
        name={platformControls.base_name}
      />
      {/* {platforms.map((platform, index) => {
        return (
          <Ground
            key={index}
            position={[
              platform.position[0],
              platform.position[1],
              platform.position[2],
            ]}
            dimensions={[
              platform.dimensions[0],
              platform.dimensions[1],
              platform.dimensions[2],
            ]}
            name={platform.name}
          />
        );
      })} */}
    </>
  );
}
