import { subtract } from "@jscad/modeling/src/operations/booleans";
import { extrudeLinear } from "@jscad/modeling/src/operations/extrusions";
import { translate } from "@jscad/modeling/src/operations/transforms";
import { cuboid, cylinder, triangle } from "@jscad/modeling/src/primitives";
import convert from "convert";

const radius = convert(18, "in").to("mm");

const segments = 100;

const base = {
  width: 150,
  height: 50,
  depth: 50,
  angle: Math.PI / 2.5,
};

const slot = {
  hole: 20,
  width: 20,
  height: 5,
  rise: base.height / 2,
};

export const main = () => {
  return subtract(
    translate(
      [-base.width / 2, 0, -base.depth / 2],
      extrudeLinear(
        { height: base.depth },
        triangle({ type: "ASA", values: [base.angle, base.width, base.angle] })
      )
    ),
    cylinder({
      radius: radius,
      height: base.depth,
      center: [0, radius + base.height, 0],
      segments,
    }),
    cuboid({
      size: [slot.width, slot.height, base.depth],
      center: [0, slot.rise, 0],
    })
  );
};
