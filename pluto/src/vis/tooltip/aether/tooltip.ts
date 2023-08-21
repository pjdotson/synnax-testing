// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { Box, Direction, XY, XYScale } from "@synnaxlabs/x";
import { z } from "zod";

import { aether } from "@/aether/aether";
import { color } from "@/color/core";
import { theming } from "@/theming/aether";
import { Draw2D } from "@/vis/draw2d";
import { FindResult } from "@/vis/line/aether/line";
import { render } from "@/vis/render";

export const tooltipStateZ = z.object({
  position: XY.z.or(z.null()),
  textColor: color.Color.z.optional().default(color.ZERO),
  backgroundColor: color.Color.z.optional().default(color.ZERO),
  borderColor: color.Color.z.optional().default(color.ZERO),
  ruleColor: color.Color.z.optional().default(color.ZERO),
  ruleStrokeWidth: z.number().optional().default(1),
  ruleStrokeDash: z.number().default(0),
});

interface InternalState {
  render: render.Context;
  draw: Draw2D;
  dotColor: color.Color;
  dotColorContrast: color.Color;
}

export interface TooltipProps {
  findByXDecimal: (position: number) => Promise<FindResult[]>;
  region: Box;
}

export class Tooltip extends aether.Leaf<typeof tooltipStateZ, InternalState> {
  static readonly TYPE = "tooltip";
  schema = tooltipStateZ;

  afterUpdate(): void {
    const theme = theming.use(this.ctx);
    if (this.state.textColor.isZero) this.state.textColor = theme.colors.text;
    if (this.state.backgroundColor.isZero)
      this.state.backgroundColor = theme.colors.gray.m2;
    if (this.state.borderColor.isZero) this.state.borderColor = theme.colors.border;
    if (this.state.ruleColor.isZero) this.state.ruleColor = theme.colors.gray.m0;
    this.internal.dotColor = theme.colors.text;
    this.internal.dotColorContrast = theme.colors.textContrast;

    this.internal.render = render.Context.use(this.ctx);
    this.internal.draw = new Draw2D(this.internal.render.upper2d, theme);
    render.Controller.requestRender(this.ctx);
  }

  afterDelete(): void {
    render.Controller.requestRender(this.ctx);
  }

  async render(props: TooltipProps): Promise<void> {
    if (this.deleted || this.state.position == null) return;
    const { region } = props;
    const scale = XYScale.scale(Box.DECIMAL).scale(region);
    const reverseScale = XYScale.scale(region).scale(Box.DECIMAL);
    const values = await props.findByXDecimal(
      reverseScale.x.pos(this.state.position.x)
    );
    const { draw } = this.internal;

    const avgXDecimal = values.reduce((p, c) => p + c.position.x, 0) / values.length;

    const rulePosition = scale.x.pos(avgXDecimal);
    if (!region.xBounds.contains(rulePosition)) return;

    draw.rule({
      stroke: this.state.ruleColor,
      lineWidth: this.state.ruleStrokeWidth,
      lineDash: this.state.ruleStrokeDash,
      direction: Direction.Y,
      region,
      position: rulePosition,
    });

    values.forEach((r) => {
      const position = scale.pos(r.position);
      draw.circle({ fill: r.color.setAlpha(0.5), radius: 8, position });
      draw.circle({ fill: r.color.setAlpha(0.8), radius: 5, position });
      draw.circle({
        fill: r.color.pickByContrast(
          this.internal.dotColor,
          this.internal.dotColorContrast
        ),
        radius: 2,
        position,
      });
    });

    const text = values.map((r) => `${r.label ?? ""}: ${r.value.y.toFixed(2)}`);

    draw.textContainer({
      text,
      position: this.state.position.translate([10, 10]),
      direction: Direction.Y,
      level: "small",
      spacing: 1,
    });
  }
}

export const REGISTRY: aether.ComponentRegistry = {
  [Tooltip.TYPE]: Tooltip,
};
