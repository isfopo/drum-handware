import { subtract } from "@jscad/modeling/src/operations/booleans";
import { cylinder } from "@jscad/modeling/src/primitives";
import convert from "convert";

const segments = 50;

enum Part {
  Ring,
}

const parts = Part.Ring as Part;

interface TemplateRingParams {
  radius: number;
  thickness: number;
  width: number;
}

const ringGeo = ({ radius, thickness, width }: TemplateRingParams) => {
  return subtract(
    cylinder({
      height: thickness,
      radius: radius + width,
      segments,
    }),
    cylinder({
      height: thickness,
      radius,
      segments,
    })
  );
};

export const main = () => {
  switch (parts) {
    case Part.Ring:
      return ringGeo({
        radius: convert(5, "in").to("mm") / 2,
        thickness: convert(1 / 8, "in").to("mm"),
        width: convert(1 / 2, "in").to("mm"),
      });
  }
};
