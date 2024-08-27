import { subtract, union } from "@jscad/modeling/src/operations/booleans";
import { extrudeRotate } from "@jscad/modeling/src/operations/extrusions";
import { arc, cylinder, line } from "@jscad/modeling/src/primitives";
import { expand } from "@jscad/modeling/src/operations/expansions";
import convert from "convert";
import { Path2 } from "@jscad/modeling/src/geometries/types";
// @ts-ignore
import { thread } from "jscad-threadlib";
import { translate } from "@jscad/modeling/src/operations/transforms";

const segments = 50;

enum Part {
  Template,
  Port,
  Ring,
  All,
}

const parts = Part.Port as Part;

const diameter = convert(5, "in").to("mm");

interface TemplateParams {
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

const templateGeo = ({ diameter, thickness, width }: TemplateParams) => {
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

  // Specifying thread parameters
  const threadSpecs = [
    convert(1 / 6, "in").to("mm"), // Pitch
    (diameter - outwardRadius) / 2, // Rotation Radius (mm)
    24.51, // Support Diameter (mm)
    [
      [0, -convert(1 / 16, "in").to("mm")],
      [0, convert(1 / 16, "in").to("mm")],
      [convert(1 / 12, "in").to("mm"), convert(1 / 64, "in").to("mm")],
      [convert(1 / 12, "in").to("mm"), -convert(1 / 64, "in").to("mm")],
    ], // Section Profile (mm, Points[])
  ];

  const threadTurns = 6;
  const threadHeight = ((threadSpecs[0] as number) * threadTurns) / 2;

  const round = (path: Path2) => {
    return extrudeRotate(
      { segments },
      expand({ delta: thickness / 2, corners: "round" }, path)
    );
  };

  const port = union(
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
    ),
    translate(
      [0, 0, depth - threadHeight],
      thread({
        thread: threadSpecs,
        turns: threadTurns,
        segments,
      })
    )
  );

  const ring = {};

  return { port, ring };
};

export const main = () => {
  const template = templateGeo({
    diameter,
    thickness: convert(1 / 8, "in").to("mm"),
    width: convert(1 / 2, "in").to("mm"),
  });

  const { port, ring } = portGeo({
    diameter,
    depth: convert(4, "in").to("mm"),
    thickness: convert(1 / 8, "in").to("mm"),
    outwardRadius: convert(1 / 2, "in").to("mm"),
    rimWidth: convert(1 / 2, "in").to("mm"),
  });

  switch (parts) {
    case Part.Template:
      return template;
    case Part.Port:
      return port;
    case Part.Ring:
      return ring;
    case Part.All:
      return union(template, port);
  }
};
