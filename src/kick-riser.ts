import { TAU } from "@jscad/modeling/src/maths/constants";
import { subtract, union } from "@jscad/modeling/src/operations/booleans";
import { rotate, translate } from "@jscad/modeling/src/operations/transforms";
import {
  cuboid,
  cylinder,
  roundedCuboid,
} from "@jscad/modeling/src/primitives";
import convert from "convert";

export type Part = "base" | "mount";

const part: Part = "mount";

const radius = convert(18, "in").to("mm");

const width = 100;
const thickness = 6;
const depth = 50;

const base = {
  width,
  height: 50,
  thickness,
  depth,
};

const holes = {
  width: 10,
  height: 25,
  spacing: width * (3 / 4),
};

export const main = () => {
  switch (part) {
    case "base":
      const holeGeo = (side: "left" | "right") => {
        return translate(
          [
            (side === "left" ? holes.spacing : -holes.spacing) / 2,
            base.depth / 2,
            base.height / 2,
          ],
          union(
            cuboid({
              size: [holes.width, base.thickness, holes.height],
            }),
            rotate(
              [Math.PI / 2, 0, 0],
              cylinder({
                height: base.thickness,
                radius: holes.width / 2,
                center: [0, holes.height / 2, 0],
              })
            )
          )
        );
      };
      return union(
        subtract(
          roundedCuboid({
            size: [base.width, base.thickness, base.height],
            center: [0, base.depth / 2, base.height / 2],
          }),
          holeGeo("left"),
          holeGeo("right")
        ),
        roundedCuboid({
          size: [base.width, depth, base.thickness],
          center: [0, 0, thickness / 2],
        })
      );
    case "mount":
      return cuboid();
  }
};
