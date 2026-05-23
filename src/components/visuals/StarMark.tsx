import { SVGProps } from "react";

export function StarMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" {...props}>
      <use href="#star" />
    </svg>
  );
}
