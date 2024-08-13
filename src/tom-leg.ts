import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { subtract, union } from "@jscad/modeling/src/operations/booleans";
import { extrudeLinear } from "@jscad/modeling/src/operations/extrusions";
import { rotate, translate } from "@jscad/modeling/src/operations/transforms";
import { circle, cylinder, polygon } from "@jscad/modeling/src/primitives";
import convert from "convert";
// @ts-ignore
import { thread } from "jscad-threadlib";

const segments = 50;

const pillar = {
  height: convert(2, "in").to("mm"),
  diameter: convert(1, "in").to("mm"),
};

const rod = {
  diameter: convert(3 / 8, "in").to("mm"),
  height: convert(1.5, "ft").to("mm"),
};

const leg = {
  angle: Math.PI / 2,
  height: convert(4, "in").to("mm"),
  width: convert(1, "in").to("mm"),
  spread: convert(1 + 1 / 4, "in").to("mm"),
};

const foot = {};

const showRod: boolean = false;
const threaded: boolean = false;

export const main = () => {
  const base = cylinder({
    radius: pillar.diameter / 2,
    height: pillar.height,
    center: [0, -leg.spread, leg.height / 2 + pillar.height / 2],
    segments,
  });

  const leg1Geometry = rotate(
    [0, 0, Math.PI - leg.angle],
    extrudeLinear(
      { height: leg.height, twistAngle: leg.angle, twistSteps: segments },
      circle({ radius: leg.width / 2, center: [0, leg.spread], segments })
    )
  );

  const leg2Geometry = translate(
    [0, -leg.spread * 2, 0],
    rotate(
      [0, 0, Math.PI + leg.angle],
      extrudeLinear(
        { height: leg.height, twistAngle: leg.angle, twistSteps: segments },
        circle({ radius: leg.width / 2, center: [0, leg.spread], segments })
      )
    )
  );

  const rodGeometry = translate(
    [0, -leg.spread, rod.height / 2],
    union(
      cylinder({
        radius: (rod.diameter * (threaded ? 0.82 : 1)) / 2,
        height: rod.height,
      }),
      threaded
        ? (thread({
            thread: "UNC-3/8-ext",
            turns: 300,
            segments,
          }) as Geom3)
        : []
    )
  );

  return (showRod ? union : subtract)(
    union(leg1Geometry, leg2Geometry, base),
    rodGeometry
  );
};
