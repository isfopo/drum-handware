import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { subtract, union } from "@jscad/modeling/src/operations/booleans";
import { extrudeLinear } from "@jscad/modeling/src/operations/extrusions";
import { rotate, translate } from "@jscad/modeling/src/operations/transforms";
import { cuboid, cylinder, triangle } from "@jscad/modeling/src/primitives";
import convert from "convert";
// @ts-ignore
import { bolt } from "jscad-threadlib";

// https://www.homedepot.com/p/Everbilt-3-in-x-3-in-Zinc-Plated-T-Plate-2-Pack-15169/202033997#overlay

const diameter = convert(18, "in").to("mm");

const segments = 100;

const base = {
  width: convert(5, "in").to("mm"),
  height: convert(2, "in").to("mm"),
  depth: convert(2, "in").to("mm"),
  angle: Math.PI / 2.5,
};

const slot = {
  hole: convert(1 / 4, "in").to("mm"),
  width: convert(3 / 4, "in").to("mm"),
  height: convert(1 / 16, "in").to("mm"),
  rise: convert(1 / 2, "in").to("mm"),
};

const peg = {
  thread: "UNC-1 1/4-ext",
  turnSlot: {
    length: 8,
    width: 1,
    depth: 10,
  },
};

const printPeg = false;

const makePeg = () => {
  const offset = 3;
  return subtract(
    union(
      cylinder({
        radius: slot.hole / 2,
        height: slot.rise + slot.height,
        segments,
      }),
      translate(
        [0, 0, offset],
        bolt({
          thread: peg.thread,
          turns: 4,
        }) as Geom3
      )
    ),
    printPeg
      ? cuboid({
          size: [peg.turnSlot.width, peg.turnSlot.length, peg.turnSlot.depth],
          center: [0, 0, slot.rise / 2 + offset],
        })
      : []
  );
};

export const main = () => {
  if (printPeg) {
    return makePeg();
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
      radius: diameter / 2,
      height: base.depth,
      center: [0, diameter / 2 + base.height, 0],
      segments,
    }),
    cuboid({
      size: [slot.width, slot.height, base.depth],
      center: [0, slot.rise, 0],
    }),
    translate([0, slot.rise / 2, 0], rotate([Math.PI / 2, 0, 0], makePeg()))
  );
};
