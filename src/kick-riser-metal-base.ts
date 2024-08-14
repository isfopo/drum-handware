import { subtract } from "@jscad/modeling/src/operations/booleans";
import { extrudeLinear } from "@jscad/modeling/src/operations/extrusions";
import { rotate, translate } from "@jscad/modeling/src/operations/transforms";
import { cuboid, cylinder, triangle } from "@jscad/modeling/src/primitives";
import convert from "convert";

// https://www.homedepot.com/p/Everbilt-3-in-x-3-in-Zinc-Plated-T-Plate-2-Pack-15169/202033997#overlay

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

const peg = {
  radius: 6,
  underset: 1,
};

const printPeg = false;

export const main = () => {
  if (printPeg) {
    return rotate(
      [Math.PI / 2, 0, 0],
      cylinder({
        radius: peg.radius - peg.underset,
        height: base.depth / 2,
        segments,
      })
    );
  }
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
    }),
    rotate(
      [Math.PI / 2, 0, 0],
      cylinder({
        radius: peg.radius,
        height: base.depth,
        segments,
      })
    )
  );
};
