import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { TAU } from "@jscad/modeling/src/maths/constants";
import { subtract, union } from "@jscad/modeling/src/operations/booleans";
import { rotate, translate } from "@jscad/modeling/src/operations/transforms";
import { cylinder } from "@jscad/modeling/src/primitives";
import convert from "convert";

const segments = 100;

const shell = {
  diameter: convert(8, "in").to("mm"),
  thickness: convert(1 / 4, "in").to("mm"),
  height: convert(4, "in").to("mm"),
};

const rim = {
  inset: convert(1, "in").to("mm"),
  thickness: convert(1 / 4, "in").to("mm"),
  screws: {
    diameter: convert(1 / 8, "in").to("mm"),
    count: 4,
  },
};

const flangeMount = {
  offset: -shell.height / 8,
  angle: Math.PI / 4,
  diameter: convert(1, "in").to("mm"),
  thickness: convert(1 / 4, "in").to("mm"),
  screws: {
    count: 3,
    diameter: convert(1 / 8, "in").to("mm"),
    inset: convert(3 / 4, "in").to("mm"),
  },
};

export const main = () => {
  const screwGeo = () => {
    const screws: Geom3[] = [];
    for (let i = 0; i < rim.screws.count; i++) {
      screws.push(
        rotate(
          [0, 0, i * (TAU / rim.screws.count)],
          cylinder({
            radius: rim.screws.diameter / 2,
            height: rim.thickness * 2,
            center: [
              (shell.diameter - rim.inset / 2) / 2,
              0,
              -shell.height / 2 + rim.thickness,
            ],
            segments,
          })
        )
      );
    }
    return screws;
  };
  const transform = (geo: Geom3) =>
    translate(
      [(shell.diameter + shell.thickness) / 2, 0, flangeMount.offset],
      rotate([0, Math.PI / 2, 0], geo)
    );

  const flangeMountGeo = (isInner: boolean = false) => {
    const flangeScrewGeo = () => {
      const screws: Geom3[] = [];
      for (let i = 0; i < flangeMount.screws.count; i++) {
        screws.push(
          transform(
            rotate(
              [0, 0, i * (TAU / flangeMount.screws.count)],
              cylinder({
                radius: flangeMount.screws.diameter / 2,
                height: flangeMount.thickness,
                center: [flangeMount.screws.inset / 2, 0, 0],
                segments,
              })
            )
          )
        );
      }
      return screws;
    };

    return {
      outer: rotate(
        [0, 0, flangeMount.angle],
        transform(
          cylinder({
            radius: flangeMount.diameter / 2,
            height: flangeMount.thickness,
            center: [0, 0, 0],
            segments,
          })
        )
      ),
      inner: rotate(
        [0, 0, flangeMount.angle],
        translate(
          [-shell.thickness / 2, 0, 0],
          transform(
            cylinder({
              radius: flangeMount.diameter / 2,
              height: flangeMount.thickness,
              center: [0, 0, 0],
              segments,
            })
          )
        )
      ),
      screws: rotate([0, 0, flangeMount.angle], flangeScrewGeo()),
    };
  };

  return union(
    subtract(
      cylinder({
        radius: shell.diameter / 2 + shell.thickness,
        height: shell.height,
        segments,
      }),

      ...screwGeo(),

      cylinder({
        radius: shell.diameter / 2,
        height: shell.height - rim.thickness,
        center: [0, 0, rim.thickness / 2],
        segments,
      }),
      cylinder({
        radius: (shell.diameter - rim.inset) / 2,
        height: shell.height,
        segments,
      }),
      flangeMountGeo().screws,
      flangeMountGeo().inner
    ),
    subtract(flangeMountGeo().outer, flangeMountGeo().screws)
  );
};
