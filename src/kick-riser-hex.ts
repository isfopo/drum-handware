import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { TAU } from "@jscad/modeling/src/maths/constants";
import {
  intersect,
  subtract,
  union,
} from "@jscad/modeling/src/operations/booleans";
import { expand } from "@jscad/modeling/src/operations/expansions";
import { extrudeLinear } from "@jscad/modeling/src/operations/extrusions";
import { rotate, translate } from "@jscad/modeling/src/operations/transforms";
import {
  circle,
  cylinder,
  rectangle,
  triangle,
} from "@jscad/modeling/src/primitives";
import convert from "convert";
//@ts-ignore
import { honeycomb as honeycombGeo } from "jscad-honeycomb";

// https://www.homedepot.com/p/Everbilt-3-in-x-3-in-Zinc-Plated-T-Plate-2-Pack-15169/202033997#overlay

const diameter = convert(18, "in").to("mm");

const segments = 200;

const base = {
  width: convert(5 + 1 / 2, "in").to("mm"),
  height: convert(2, "in").to("mm"),
  depth: convert(5 / 2, "in").to("mm"),
  padding: convert(1 / 8, "in").to("mm"),
  angle: Math.PI / 2.5,
};

const slot = {
  width: convert(3 / 4, "in").to("mm"),
  height: convert(3 / 4, "in").to("mm"),
};

const honeycomb = {
  rows: 4,
  columns: 6,
  radius: convert(3 / 4, "in").to("mm"),
  gap: convert(1 / 8, "in").to("mm"),
  height: base.depth,
};

const screws = {
  count: 2,
  spread: convert(5 / 4, "in").to("mm"),
  diameter: convert(1 / 8, "in").to("mm"),
  length: convert(3 / 8, "in").to("mm"),
};

const screwHolesGeo = () => {
  return union(
    translate(
      [0, slot.height, screws.spread / 2],
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
      [0, slot.height, -(screws.spread / 2)],
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

const outline = () => {
  return extrudeLinear(
    { height: base.depth },
    subtract(
      translate(
        [-base.width / 2, 0, -base.depth / 2],
        triangle({
          type: "ASA",
          values: [base.angle, base.width, base.angle],
        })
      ),
      circle({
        radius: diameter / 2,
        center: [0, diameter / 2 + base.height],
        endAngle: TAU - base.angle,
        startAngle: Math.PI + base.angle,
        segments,
      }),
      rectangle({
        center: [0, slot.height / 2],
        size: [slot.width, slot.height],
      })
    )
  );
};

const inline = () => {
  return extrudeLinear(
    { height: base.depth },
    subtract(
      translate(
        [
          -base.width / 2 + base.padding * (Math.PI / 2),
          base.padding,
          -base.depth / 2,
        ],
        triangle({
          type: "ASA",
          values: [base.angle, base.width - base.padding * Math.PI, base.angle],
        })
      ),
      circle({
        radius: diameter / 2 + base.padding,
        center: [0, diameter / 2 + base.height],
        endAngle: TAU - base.angle,
        startAngle: Math.PI + base.angle,
        segments,
      }),
      rectangle({
        center: [0, (slot.height + screws.length) / 2],
        size: [slot.width + base.padding * 2, slot.height + screws.length],
      })
    )
  );
};

const shell = () => {
  return subtract(outline(), inline(), screwHolesGeo());
};

const inner = () => {
  return intersect(
    inline(),
    translate(
      [(-base.width + honeycomb.radius + honeycomb.gap / 2) / 2, 0, 0],
      honeycombGeo(honeycomb) as Geom3
    )
  );
};

export const main = () => {
  return union(shell(), inner());
};
