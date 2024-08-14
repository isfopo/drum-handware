import { subtract } from "@jscad/modeling/src/operations/booleans";
import { cylinder } from "@jscad/modeling/src/primitives";
import convert from "convert";

const segments = 10;

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
  return subtract(
    cylinder({
      radius: diameter / 2 + thickness,
      height: height,
      segments,
    }),
    cylinder({
      radius: diameter / 2,
      height: height - rim.thickness,
      center: [0, 0, rim.thickness / 2],
      segments,
    }),
    cylinder({
      radius: (diameter - rim.inset * 2) / 2,
      height: height,
      segments,
    })
  );
};
