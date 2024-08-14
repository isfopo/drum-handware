import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { TAU } from "@jscad/modeling/src/maths/constants";
import { subtract, union } from "@jscad/modeling/src/operations/booleans";
import { rotate } from "@jscad/modeling/src/operations/transforms";
import { cylinder } from "@jscad/modeling/src/primitives";
import convert from "convert";

const segments = 50;

const diameter = convert(8, "in").to("mm");
const thickness = convert(0.5, "in").to("mm");
const height = convert(4, "in").to("mm");

const rim = {
  inset: convert(3 / 4, "in").to("mm"),
  thickness: convert(1 / 4, "in").to("mm"),
  screws: {
    diameter: convert(1 / 8, "in").to("mm"),
    count: 4,
  },
};

export const main = () => {
  const screwGeo = () => {
    const screws: Geom3[] = [];
    for (let i = 0; i < rim.screws.count; i++) {
      screws.push(
        rotate(
          [0, 0, i * (TAU / rim.screws.count)],
          cylinder({
            radius: rim.screws.diameter / 2,
            height: rim.thickness * 2,
            center: [
              (diameter - rim.inset / 2) / 2,
              0,
              -height / 2 + rim.thickness,
            ],
            segments,
          })
        )
      );
    }
    return screws;
  };
  return subtract(
    cylinder({
      radius: diameter / 2 + thickness,
      height: height,
      segments,
    }),
    ...screwGeo(),

    cylinder({
      radius: diameter / 2,
      height: height - rim.thickness / 2,
      center: [0, 0, rim.thickness / 2],
      segments,
    }),
    cylinder({
      radius: (diameter - rim.inset) / 2,
      height: height,
      segments,
    })
  );
};
