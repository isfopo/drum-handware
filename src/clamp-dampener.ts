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
import { expand } from "@jscad/modeling/src/operations/expansions";
import { TAU } from "@jscad/modeling/src/maths/constants";

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
  Arm,
  Head,
  All,
}

const part = Part.Clip as Part;

const boltDiameter = convert(3 / 16, "in").to("mm");
const boltSpacing = convert(3 / 4, "in").to("mm");

interface ClipParams {
  width: number;
  thickness: number;
  clasp: {
    depth: number;
    height: number;
  };
  boltHoles: {
    span: number;
    width: number;
    inset: number;
  };
  forKick: boolean;
}

interface ArmParams {
  width: number;
  thickness: number;
  length: number;
  slideHole: {
    width: number;
    length: number;
  };
  boltHoles: {
    span: number;
    diameter: number;
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

const clipGeometry = ({
  thickness,
  width,
  boltHoles,
  clasp,
  forKick,
}: ClipParams) => {
  const radius = clasp.depth / 2 + thickness / 2;
  const topClipAngle = forKick ? degToRad(90) : degToRad(180);
  const bottomClipAngle = forKick ? degToRad(180) : degToRad(270);
  const clipBracketLocation = {
    x: forKick ? -radius : 0,
    y: forKick ? 0 : -clasp.height / 2 + -radius,
  };

  const bodyGeo = () => {
    const paths = [
      arc({
        center: [0, clasp.height / 2],
        radius: radius,
        startAngle: 0,
        endAngle: topClipAngle,
        segments,
      }),
      line([
        [radius, clasp.height / 2],
        [radius, -clasp.height / 2],
      ]),
      arc({
        center: [0, -clasp.height / 2],
        radius: radius,
        startAngle: bottomClipAngle,
        endAngle: 0,
        segments,
      }),
      line([
        [clipBracketLocation.x, clipBracketLocation.y],
        [
          -boltHoles.span +
            -boltHoles.inset +
            -(width + boltHoles.width) / 2 +
            clipBracketLocation.x,
          clipBracketLocation.y,
        ],
      ]),
    ];

    if (forKick) {
      paths.push(
        line([
          [clipBracketLocation.x, clipBracketLocation.y],
          [clipBracketLocation.x, clipBracketLocation.y - clasp.height / 2],
        ])
      );
    }

    return union(
      extrudeLinear(
        { height: width },
        expand({ delta: thickness / 2, corners: "round" }, ...paths)
      )
    );
  };

  const boltHoleGeo = () => {
    return translate(
      [
        -boltHoles.inset + clipBracketLocation.x,
        clipBracketLocation.y,
        width / 2,
      ],
      rotate(
        [0, degToRad(90), degToRad(90)],
        union(
          rotate(
            [0, 0, TAU / 8],
            cuboid({
              size: [boltHoles.width, boltHoles.width, thickness],
            })
          ),
          translate(
            [0, boltHoles.span, 0],
            rotate(
              [0, 0, TAU / 8],
              cuboid({
                size: [boltHoles.width, boltHoles.width, thickness],
              })
            )
          )
        )
      )
    );
  };

  return subtract(bodyGeo(), boltHoleGeo());
};

const armGeometry = ({
  width,
  length,
  thickness,
  slideHole,
  boltHoles,
}: ArmParams) => {
  const slideHoleGeo = () => {
    return translate(
      [0, length / 2 - slideHole.length / 2 - (width - slideHole.width) / 2, 0],
      pill({
        size: [slideHole.width, slideHole.length, thickness],
        roundRadius: slideHole.width / 2 - 0.1,
      })
    );
  };

  const boltHoleGeo = () => {
    return translate(
      [0, -length / 2 + (width - boltHoles.diameter / 2) / 2, thickness / 2],
      union(
        cylinder({
          height: thickness,
          radius: boltHoles.diameter / 2,
          segments,
        }),
        translate(
          [0, boltHoles.span, 0],
          cylinder({
            height: thickness,
            radius: boltHoles.diameter / 2,
            segments,
          })
        )
      )
    );
  };

  return subtract(
    pill({
      size: [width, length, thickness],
      roundRadius: width / 2 - 0.1,
    }),
    slideHoleGeo(),
    boltHoleGeo()
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
  const clip = clipGeometry({
    width: convert(1, "in").to("mm"),
    thickness: convert(1 / 4, "in").to("mm"),
    clasp: {
      height: convert(1, "in").to("mm"),
      depth: convert(1 / 2, "in").to("mm"),
    },
    boltHoles: {
      width: convert(1 / 4, "in").to("mm"),
      span: boltSpacing,
      inset: convert(2, "in").to("mm"),
    },
    forKick: true,
  });

  const arm = armGeometry({
    width: convert(1, "in").to("mm"),
    length: convert(4, "in").to("mm"),
    thickness: convert(1 / 4, "in").to("mm"),
    slideHole: {
      width: boltDiameter,
      length: convert(2, "in").to("mm"),
    },
    boltHoles: {
      diameter: boltDiameter,
      span: boltSpacing,
    },
  });

  const head = headGeometry({
    diameter: convert(2, "in").to("mm"),
    thickness: convert(1 / 4, "in").to("mm"),
    bolt: {
      width: convert(1 / 4, "in").to("mm"),
      screwDiameter: boltDiameter,
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

  switch (part) {
    case Part.Clip:
      return clip;

    case Part.Arm:
      return arm;

    case Part.Head:
      return head;

    default:
      return union(
        translate([120, 0, 0], clip),
        translate([0, 0, 0], arm),
        translate([-80, 0, 0], head)
      );
  }
};
