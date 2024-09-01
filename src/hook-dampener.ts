import { subtract, union } from "@jscad/modeling/src/operations/booleans";
import { rotate, translate } from "@jscad/modeling/src/operations/transforms";
import {
  arc,
  cuboid,
  cylinder,
  cylinderElliptic,
  line,
  polygon,
} from "@jscad/modeling/src/primitives";
import convert from "convert";
import { pill } from "./helpers/shapes";
import { extrudeLinear } from "@jscad/modeling/src/operations/extrusions";
import { degToRad } from "@jscad/modeling/src/utils";
import { expand, offset } from "@jscad/modeling/src/operations/expansions";
import { TAU } from "@jscad/modeling/src/maths/constants";
import { Vec2 } from "@jscad/modeling/src/maths/types";

/**
 * Hardware
 * 3 bolts
 * 1 nut
 * 2 wing nuts
 * 3 springs
 * 1 cymbal felt
 * Glue
 */

enum Part {
  Clip,
  Head,
  All,
}

const part = Part.Clip as Part;

const boltDiameter = convert(1 / 4, "in").to("mm");

interface ClipParams {
  width: number;
  thickness: number;
  offset: number;
  clasp: {
    depth: number;
    height: number;
  };
  bolt: {
    width: number;
    inset: number;
  };
  forKick: boolean;
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

const clipGeometry = ({
  thickness,
  width,
  bolt,
  clasp,
  forKick,
  offset,
}: ClipParams) => {
  const radius = clasp.depth / 2 + thickness / 2;
  const delta = thickness / 2;
  const midHeight = clasp.height + delta - radius * 2;
  const topClipAngle = forKick ? degToRad(90) : degToRad(180);
  const bottomClipAngle = forKick ? degToRad(180) : degToRad(270);
  const clipBracketLocation = forKick
    ? [-radius, 0]
    : [0, -midHeight / 2 + -radius];

  const bodyGeo = () => {
    const paths = [
      arc({
        center: [0, midHeight / 2],
        radius: radius,
        startAngle: 0,
        endAngle: topClipAngle,
        segments,
      }),
      line([
        [radius, midHeight / 2],
        [radius, -midHeight / 2],
      ]),
      arc({
        center: [0, -midHeight / 2],
        radius: radius,
        startAngle: bottomClipAngle,
        endAngle: 0,
        segments,
      }),
      arc({
        center: [-radius * 1.5, -midHeight / 2 + -radius / 2],
        radius: radius / 2,
        startAngle: bottomClipAngle,
        endAngle: 0,
        segments,
      }),
      line([
        [clipBracketLocation[0], clipBracketLocation[1]],
        [
          -(width + bolt.width) / 2 + clipBracketLocation[0] + -2,
          clipBracketLocation[1],
        ],
      ]),
      arc({
        center: [
          clipBracketLocation[0] + -radius * 2,
          clipBracketLocation[1] + -radius,
        ],
        radius: radius,
        startAngle: degToRad(90),
        endAngle: degToRad(180),
        segments,
      }),
      line([
        [
          clipBracketLocation[0] + -radius * 3,
          clipBracketLocation[1] + -radius,
        ],
        [
          clipBracketLocation[0] + -radius * 3,
          clipBracketLocation[1] + -radius + -offset + -2,
        ],
      ]),
      arc({
        center: [
          clipBracketLocation[0] + -radius * 4,
          clipBracketLocation[1] + -offset * 2 + -thickness,
        ],
        radius: radius,
        startAngle: bottomClipAngle,
        endAngle: 0,
        segments,
      }),
      line([
        [
          clipBracketLocation[0] + -radius * 4,
          clipBracketLocation[1] + -radius * 2 + -delta + -offset,
        ],
        [
          -bolt.inset + -(width + bolt.width) / 2 + clipBracketLocation[0],
          clipBracketLocation[1] + -radius * 2 + -delta + -offset,
        ],
      ]),
    ];

    if (forKick) {
      paths.push(
        line([
          clipBracketLocation as Vec2,
          [clipBracketLocation[0], clipBracketLocation[1] - midHeight / 2],
        ])
      );
    }

    return union(
      extrudeLinear(
        { height: width },
        expand({ delta, corners: "round" }, ...paths)
      )
    );
  };

  const boltHoleGeo = () => {
    return translate(
      [
        -bolt.inset + clipBracketLocation[0],
        clipBracketLocation[1] + -radius * 2 + -delta + -offset,
        width / 2,
      ],
      rotate(
        [0, degToRad(90), degToRad(90)],
        union(
          rotate(
            [0, 0, TAU / 8],
            cylinder({
              height: thickness,
              radius: bolt.width / 2,
            })
          )
        )
      )
    );
  };

  return subtract(bodyGeo(), boltHoleGeo());
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
  const clip = clipGeometry({
    width: convert(1, "in").to("mm"),
    thickness: convert(1 / 4, "in").to("mm"),
    offset: convert(1 / 4, "in").to("mm"),
    clasp: {
      height: convert(1 + 3 / 8, "in").to("mm"),
      depth: convert(1 / 2, "in").to("mm"),
    },
    bolt: {
      width: boltDiameter,
      inset: convert(3, "in").to("mm"),
    },
    forKick: false,
  });

  const head = headGeometry({
    diameter: 40,
    thickness: convert(1 / 4, "in").to("mm"),
    bolt: {
      width: boltDiameter,
      screwDiameter: boltDiameter,
      headDiameter: boltDiameter,
    },
    cone: {
      height: convert(1 / 4, "in").to("mm"),
      diameter: {
        top: convert(1, "in").to("mm"),
        bottom: convert(3 / 2, "in").to("mm"),
      },
    },
  });

  switch (part) {
    case Part.Clip:
      return clip;

    case Part.Head:
      return head;

    default:
      return union(translate([80, 0, 0], clip), translate([-80, 0, 0], head));
  }
};
