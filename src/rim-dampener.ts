import {
  maths,
  primitives,
  extrusions,
  transforms,
  booleans,
} from "@jscad/modeling";

const { TAU } = maths.constants;
const { rectangle, circle } = primitives;
const { extrudeRotate } = extrusions;
const { translate } = transforms;
const { union, subtract } = booleans;

import convert from "convert";

const diameter = convert(12, "in").to("mm");

const rim = {
  width: 4,
  height: 4,
};

const flange = {
  width: 50,
  thickness: 1,
};

const segments = 100;
const angle = TAU / 4;

export const main = () => {
  return subtract(
    extrudeRotate(
      { segments, angle },
      translate(
        [diameter / 2 - flange.width / 2, 0, 0],
        union(
          subtract(
            rectangle({
              size: [rim.width, rim.height],
              center: [flange.width / 2 - rim.width / 2, rim.height / 2],
            })
          ),
          rectangle({ size: [flange.width, flange.thickness] })
        )
      )
    )
  );
};
