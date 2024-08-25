import { extrudeLinear } from "@jscad/modeling/src/operations/extrusions";
import { circle, roundedRectangle } from "@jscad/modeling/src/primitives";

export interface PillParams {
  size: [number, number, number];
  roundRadius: number;
}

export const pill = ({ size, roundRadius }: PillParams) => {
  return extrudeLinear(
    { height: size[2] },
    roundedRectangle({ roundRadius, size: [size[0], size[1]] })
  );
};
