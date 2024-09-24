import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { subtract, union } from "@jscad/modeling/src/operations/booleans";
import { extrudeLinear } from "@jscad/modeling/src/operations/extrusions";
import {
  center,
  rotate,
  translate,
} from "@jscad/modeling/src/operations/transforms";
import { cuboid, cylinder, triangle } from "@jscad/modeling/src/primitives";
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

export const main = () => {
  const chamber = (
    padding: number,
    side: "left" | "right" | "center" = "left"
  ) => {
    if (side === "center") {
      return subtract(
        cuboid({
          size: [slot.width, base.height, base.depth],
          center: [
            0,
            base.height - slot.height / 2 + screws.length + padding,
            0,
          ],
        }),
        cylinder({
          radius: diameter / 2,
          height: base.depth,
          center: [0, diameter / 2 + base.height - padding, 0],
          segments,
        })
      );
    }

    return rotate(
      [0, side === "right" ? Math.PI : 0, 0],
      subtract(
        translate(
          [slot.width / 2 + padding, padding, -base.depth / 2],
          extrudeLinear(
            { height: base.depth },
            triangle({
              type: "ASA",
              values: [
                Math.PI / 2,
                base.width / 2 - (padding + slot.width),
                base.angle,
              ],
            })
          )
        ),
        cylinder({
          radius: diameter / 2,
          height: base.depth,
          center: [0, diameter / 2 + base.height - padding, 0],
          segments,
        })
      )
    );
  };

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
      center: [0, slot.height / 2, 0],
    }),
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
    ),
    chamber(convert(3 / 8, "in").to("mm"), "right"),
    chamber(convert(3 / 8, "in").to("mm"), "left")
  );
};
