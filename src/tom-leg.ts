import { subtract } from "@jscad/modeling/src/operations/booleans";
import { extrudeLinear } from "@jscad/modeling/src/operations/extrusions";
import { rotate } from "@jscad/modeling/src/operations/transforms";
import { circle, cylinder } from "@jscad/modeling/src/primitives";

const rod = {
  diameter: 10,
  height: 200,
  mass: 5,
};

const leg = {
  angle: Math.PI / 2,
  height: 100,
  width: 40,
  spread: 40,
};

const foot = {};

const threaded: boolean = false;

export const main = () => {
  return subtract(
    rotate(
      [0, 0, leg.angle],
      extrudeLinear(
        { height: leg.height, twistAngle: leg.angle, twistSteps: 100 },
        circle({ radius: leg.width / 2, center: [0, leg.spread] })
      )
    ),
    cylinder({
      radius: rod.diameter / 2,
      height: rod.height,
      center: [0, -leg.spread, rod.height / 2],
    })
  );
};
