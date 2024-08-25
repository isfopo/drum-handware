enum Part {
  Clip,
  Arm,
  Head,
}

const part = Part.Clip as Part;

const clipGeometry = () => {};
const armGeometry = () => {};
const headGeometry = () => {};

export const main = () => {
  switch (part) {
    case Part.Clip:
      return clipGeometry();
    case Part.Arm:
      return armGeometry();
    case Part.Head:
      return headGeometry();
  }
};
