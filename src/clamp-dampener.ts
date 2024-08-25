import { subtract, union } from "@jscad/modeling/src/operations/booleans";
import { translate } from "@jscad/modeling/src/operations/transforms";
import {
  cuboid,
  cylinder,
  cylinderElliptic,
} from "@jscad/modeling/src/primitives";
import convert from "convert";
import { pill } from "./helpers/shapes";

enum Part {
  Clip,
  Arm,
  Head,
}

const part = Part.Arm as Part;

interface ArmParams {
  width: number;
  thickness: number;
  length: number;
  slideHole: {
    width: number;
    length: number;
  };
}

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

const armGeometry = ({ width, length, thickness, slideHole }: ArmParams) => {
  const slideHoleGeo = () => {
    return translate(
      [0, length / 2 - slideHole.length / 2 - (width - slideHole.width) / 2, 0],
      pill({
        size: [slideHole.width, slideHole.length, thickness],
        roundRadius: slideHole.width / 2 - 0.1,
      })
    );
  };

  return subtract(
    pill({
      size: [width, length, thickness],
      roundRadius: width / 2 - 0.1,
    }),
    slideHoleGeo()
  );
};

const headGeometry = ({ diameter, thickness, bolt, cone }: HeadParams) => {
  const baseGeo = () => {
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

  const coneGeo = () => {
    const { height, diameter } = cone;
    return subtract(
      cylinderElliptic({
        height,
        endRadius: [diameter.top / 2, diameter.top / 2],
        startRadius: [diameter.bottom / 2, diameter.bottom / 2],
        segments,
      }),
      cylinder({
        height: height,
        radius: bolt.screwDiameter / 2,
        segments,
      })
    );
  };
  return union(
    baseGeo(),
    translate([0, 0, thickness / 2 + cone.height / 2], coneGeo())
  );
};

export const main = () => {
  switch (part) {
    case Part.Clip:
      return clipGeometry();
    case Part.Arm:
      return armGeometry({
        width: convert(1, "in").to("mm"),
        length: convert(4, "in").to("mm"),
        thickness: convert(1 / 4, "in").to("mm"),
        slideHole: {
          width: convert(1 / 2, "in").to("mm"),
          length: convert(2, "in").to("mm"),
        },
      });
    case Part.Head:
      return headGeometry({
        diameter: convert(2, "in").to("mm"),

        thickness: convert(1 / 8, "in").to("mm"),
        bolt: {
          width: convert(1 / 4, "in").to("mm"),
          screwDiameter: convert(3 / 16, "in").to("mm"),
          headDiameter: convert(1 / 4, "in").to("mm"),
        },
        cone: {
          height: convert(1 / 8, "in").to("mm"),
          diameter: {
            top: convert(1 / 2, "in").to("mm"),
            bottom: convert(1, "in").to("mm"),
          },
        },
      });
  }
};
