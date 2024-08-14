import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { TAU } from "@jscad/modeling/src/maths/constants";
import { subtract, union } from "@jscad/modeling/src/operations/booleans";
import { rotate } from "@jscad/modeling/src/operations/transforms";
import { cylinder } from "@jscad/modeling/src/primitives";
import convert from "convert";

const segments = 50;

const shell = {
  diameter: convert(8, "in").to("mm"),
  thickness: convert(0.5, "in").to("mm"),
  height: convert(4, "in").to("mm"),
};

const rim = {
  inset: convert(1, "in").to("mm"),
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
            height: rim.thickness,
            center: [
              (shell.diameter - rim.inset / 2) / 2,
              0,
              -shell.height / 2 + rim.thickness,
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
      radius: shell.diameter / 2 + shell.thickness,
      height: shell.height,
      segments,
    }),
    ...screwGeo(),

    cylinder({
      radius: shell.diameter / 2,
      height: shell.height - rim.thickness,
      center: [0, 0, rim.thickness / 2],
      segments,
    }),
    cylinder({
      radius: (shell.diameter - rim.inset) / 2,
      height: shell.height,
      segments,
    })
  );
};
