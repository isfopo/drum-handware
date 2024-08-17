import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { TAU } from "@jscad/modeling/src/maths/constants";
import { subtract, union } from "@jscad/modeling/src/operations/booleans";
import {
  rotate,
  transform,
  translate,
} from "@jscad/modeling/src/operations/transforms";
import { cylinder, roundedCylinder } from "@jscad/modeling/src/primitives";
import convert from "convert";
// @ts-ignore
import { bolt } from "jscad-threadlib";

const segments = 100;

enum Part {
  Shell,
  Flange,
}

const part: Part = Part.Flange as Part;

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
  diameter: convert(1.5, "in").to("mm"),
  thickness: convert(1 / 4, "in").to("mm"),
  screws: {
    count: 3,
    diameter: convert(1 / 8, "in").to("mm"),
    inset: convert(1.25, "in").to("mm"),
  },
};

const flange = {
  roundedRadius: 1,
  baseHeight: convert(1 / 2, "in").to("mm"),
  micThread: {
    diameter: convert(1 / 2, "in").to("mm"),
    height: convert(1, "in").to("mm"),
  },
};

const micThread = {
  specs: [
    0.941, // Pitch (mm)
    flange.micThread.diameter / 2, // Rotation Radius (mm)
    flange.micThread.diameter, // Support Diameter (mm)
    [
      [0, -0.9],
      [0, 0.9],
      [0.9, 0.1],
      [0.9, 0.1],
    ], // Section Profile (mm, Points[])]
  ],
};

export const getSpeakerScrews = () => {
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

export const shellGeo = () => {
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

      ...getSpeakerScrews(),

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

export const flangeGeo = () => {
  const flangeScrewGeo = () => {
    const screws: Geom3[] = [];
    for (let i = 0; i < flangeMount.screws.count; i++) {
      screws.push(
        rotate(
          [0, 0, i * (TAU / flangeMount.screws.count)],
          cylinder({
            radius: flangeMount.screws.diameter / 2,
            height: flangeMount.thickness * 2,
            center: [flangeMount.screws.inset / 2, 0, 0],
            segments,
          })
        )
      );
    }
    return screws;
  };

  return subtract(
    union(
      roundedCylinder({
        radius: flangeMount.diameter / 2,
        height: flange.baseHeight,
        roundRadius: flange.roundedRadius,
        segments,
      }),
      roundedCylinder({
        radius: flange.micThread.diameter,
        height: flange.micThread.height,
        roundRadius: flange.roundedRadius,
        segments,
      })
    ),
    translate(
      [0, 0, flange.micThread.height / 4],
      bolt({
        thread: "28-UN-5/8-ext",
        turns: 20,
      }) as Geom3
    ),
    cylinder({
      radius: flangeMount.diameter / 2,
      height: flange.micThread.height,
      center: [0, 0, -flange.micThread.height / 2],
      segments,
    }),
    ...flangeScrewGeo()
  );
};

export const main = () => {
  switch (part) {
    case Part.Shell:
      return shellGeo();
    case Part.Flange:
      return flangeGeo();
    default:
      throw new Error("Unknown part");
  }
};
