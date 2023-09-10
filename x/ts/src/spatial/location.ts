// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { z } from "zod";

import { Case } from "@/case";
import {
  location,
  type Location,
  xLocation,
  yLocation,
  direction as dir,
  DIRECTIONS,
  X_LOCATIONS,
  Y_LOCATIONS,
  CENTER_LOCATIONS,
  type XLocation,
  type OuterLocation,
  type YLocation,
  outerLocation,
} from "@/spatial/base";
import { type Direction } from "@/spatial/direction";

export {
  location,
  type Location,
  X_LOCATIONS,
  Y_LOCATIONS,
  CENTER_LOCATIONS,
  outerLocation as outer,
};

export const x = xLocation;
export const y = yLocation;

export type X = XLocation;
export type Y = YLocation;
export type Outer = OuterLocation;

const SWAPPED: Record<Location, Location> = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
  center: "center",
};

export const crude = z.union([dir, location, z.instanceof(String)]);

export type Crude = z.infer<typeof crude>;

export const construct = (cl: Crude): Location => {
  if (cl instanceof String) return cl as Location;
  if (!DIRECTIONS.includes(cl as Direction)) return cl as Location;
  else if (cl === "x") return "left";
  else return "top";
};

export const swap = (cl: Crude): Location => SWAPPED[construct(cl)];

export const direction = (cl: Crude): Direction => {
  const l = construct(cl);
  if (l === "top" || l === "bottom") return "y";
  return "x";
};

export const xy = z.object({ x: location, y: location });
export const corner = z.object({ x: xLocation, y: yLocation });

export type XY = z.infer<typeof xy>;
export type CornerXY = z.infer<typeof corner>;

export const TOP_LEFT: CornerXY = { x: "left", y: "top" };
export const TOP_RIGHT: CornerXY = { x: "right", y: "top" };
export const BOTTOM_LEFT: CornerXY = { x: "left", y: "bottom" };
export const BOTTOM_RIGHT: CornerXY = { x: "right", y: "bottom" };
export const CENTER: XY = { x: "center", y: "center" };
export const TOP_CENTER: XY = { x: "center", y: "top" };
export const BOTTOM_CENTER: XY = { x: "center", y: "bottom" };
export const RIGHT_CENTER: XY = { x: "right", y: "center" };
export const LEFT_CENTER: XY = { x: "left", y: "center" };

export const xyEquals = (a: XY, b: XY): boolean => a.x === b.x && a.y === b.y;

export const xyCouple = (a: XY): [Location, Location] => [a.x, a.y];

export const isX = (a: Crude): boolean => direction(construct(a)) === "x";

export const isY = (a: Crude): boolean => direction(construct(a)) === "y";

export const xyToString = (a: XY): string => `${a.x}${Case.capitalize(a.y)}`;
