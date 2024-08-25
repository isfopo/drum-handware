import { subtract } from "@jscad/modeling/src/operations/booleans";
import { cuboid, cylinder } from "@jscad/modeling/src/primitives";
import convert from "convert";

enum Part {
  Clip,
  Arm,
  Head,
}

const part = Part.Head as Part;

interface HeadParams {
  diameter: number;
  thickness: number;
  bolt: {
    width: number;
    screwDiameter: number;
    headDiameter: number;
  };
  cone: {
    height: number;
    diameter: {
      top: number;
      bottom: number;
    };
  };
}

const segments = 30;

const clipGeometry = () => {};
const armGeometry = () => {};
const headGeometry = ({ diameter, thickness, bolt, cone }: HeadParams) => {
  const base = () => {
    return subtract(
      cylinder({
        height: thickness,
        radius: diameter / 2,
        segments,
      }),
      cuboid({
        size: [bolt.width, bolt.width, thickness],
      })
    );
  };

  return base();
};

export const main = () => {
  switch (part) {
    case Part.Clip:
      return clipGeometry();
    case Part.Arm:
      return armGeometry();
    case Part.Head:
      return headGeometry({
        diameter: convert(2, "in").to("mm"),

        thickness: convert(1 / 8, "in").to("mm"),
        bolt: {
          width: convert(1 / 8, "in").to("mm"),
          screwDiameter: 1,
          headDiameter: 1,
        },
        cone: {
          height: 1,
          diameter: {
            top: 1,
            bottom: 3,
          },
        },
      });
  }
};
