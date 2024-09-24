import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { TAU } from "@jscad/modeling/src/maths/constants";
import { subtract, union } from "@jscad/modeling/src/operations/booleans";
import { expand } from "@jscad/modeling/src/operations/expansions";
import { extrudeLinear } from "@jscad/modeling/src/operations/extrusions";
import {
  center,
  rotate,
  translate,
} from "@jscad/modeling/src/operations/transforms";
import {
  arc,
  cuboid,
  cylinder,
  line,
  triangle,
} from "@jscad/modeling/src/primitives";
import convert from "convert";

// https://www.homedepot.com/p/Everbilt-3-in-x-3-in-Zinc-Plated-T-Plate-2-Pack-15169/202033997#overlay

const diameter = convert(18, "in").to("mm");

const segments = 100;

const base = {
  width: convert(5 + 1 / 2, "in").to("mm"),
  height: convert(2, "in").to("mm"),
  depth: convert(5 / 2, "in").to("mm"),
  angle: Math.PI / 2.5,
};

const slot = {
  width: convert(3 / 4, "in").to("mm"),
  height: convert(3 / 4, "in").to("mm"),
};

const screws = {
  count: 2,
  spread: convert(5 / 4, "in").to("mm"),
  diameter: convert(1 / 8, "in").to("mm"),
  length: convert(1 / 2, "in").to("mm"),
};

const screwHolesGeo = () => {
  return union(
    translate(
      [0, screws.length / 2 + slot.height, screws.spread / 2],
      rotate(
        [Math.PI / 2, 0, 0],
        union(
          cylinder({
            radius: screws.diameter / 2,
            height: screws.length,
          })
        )
      )
    ),
    translate(
      [0, screws.length / 2 + slot.height, -(screws.spread / 2)],
      rotate(
        [Math.PI / 2, 0, 0],
        union(
          cylinder({
            radius: screws.diameter / 2,
            height: screws.length,
          })
        )
      )
    )
  );
};

export const main = () => {
  // Extrude the Geom2 arc to create a 3D shape
  return extrudeLinear(
    { height: base.depth },
    expand(
      { delta: 3, corners: "edge" },
      arc({
        radius: diameter / 2,
        center: [0, diameter / 2 + base.height],
        endAngle: TAU - base.angle,
        startAngle: Math.PI + base.angle,
        segments,
      })
    )
  );
};
