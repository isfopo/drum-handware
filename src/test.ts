import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { subtract, union } from "@jscad/modeling/src/operations/booleans";
import { cylinder } from "@jscad/modeling/src/primitives";
import convert from "convert";
// @ts-ignore
import { thread } from "jscad-threadlib";

export const main = () => {
  const threading = union(
    cylinder({
      height: 14,
      radius: (convert(3 / 8, "in").to("mm") * 0.81) / 2,
      segments: 100,
    }),
    thread({
      thread: "UNC-3/8-ext",
      turns: 10,
      segments: 100,
    }) as Geom3
  );

  const nut = cylinder({
    radius: convert(3 / 8, "in").to("mm"),
    height: 10,
    segments: 8,
  });

  return subtract(nut, threading);
};
