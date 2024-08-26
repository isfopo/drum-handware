import { subtract, union } from "@jscad/modeling/src/operations/booleans";
import {
  extrudeLinear,
  extrudeRotate,
} from "@jscad/modeling/src/operations/extrusions";
import { arc, cylinder, line } from "@jscad/modeling/src/primitives";
import { expand } from "@jscad/modeling/src/operations/expansions";
import convert from "convert";
import { Geom2, Path2 } from "@jscad/modeling/src/geometries/types";

const segments = 50;

enum Part {
  Ring,
  Port,
}

const parts = Part.Port as Part;

const diameter = convert(5, "in").to("mm");

interface RingParams {
  diameter: number;
  thickness: number;
  width: number;
}

interface PortParams {
  diameter: number;
  depth: number;
  thickness: number;
  outwardRadius: number;
  rimWidth: number;
}

const ringGeo = ({ diameter, thickness, width }: RingParams) => {
  return subtract(
    cylinder({
      height: thickness,
      radius: diameter / 2 + width,
      segments,
    }),
    cylinder({
      height: thickness,
      radius: diameter / 2,
      segments,
    })
  );
};

const portGeo = ({
  diameter,
  depth,
  thickness,
  outwardRadius,
  rimWidth,
}: PortParams) => {
  const innerDiameter = diameter - thickness - outwardRadius;

  const round = (path: Path2) => {
    return extrudeRotate(
      { segments },
      expand({ delta: thickness / 2, corners: "round" }, path)
    );
  };

  return union(
    round(
      line([
        [innerDiameter / 2, 0],
        [innerDiameter / 2, depth],
      ])
    ),
    round(
      arc({
        center: [(innerDiameter + outwardRadius) / 2 + thickness * 2, depth],
        radius: outwardRadius,
        startAngle: Math.PI / 2,
        endAngle: Math.PI,
        segments,
        makeTangent: true,
      })
    ),
    round(
      line([
        [diameter / 2 + thickness, depth + outwardRadius],
        [diameter / 2 + rimWidth, depth + outwardRadius],
      ])
    )
  );
};

export const main = () => {
  switch (parts) {
    case Part.Ring:
      return ringGeo({
        diameter,
        thickness: convert(1 / 8, "in").to("mm"),
        width: convert(1 / 2, "in").to("mm"),
      });
    case Part.Port:
      return portGeo({
        diameter,
        depth: convert(4, "in").to("mm"),
        thickness: convert(1 / 8, "in").to("mm"),
        outwardRadius: convert(1 / 2, "in").to("mm"),
        rimWidth: convert(1 / 2, "in").to("mm"),
      });
  }
};
