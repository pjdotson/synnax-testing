// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { ReactElement, useLayoutEffect } from "react";

import { Deep, Optional } from "@synnaxlabs/x";

import { Aether } from "@/aether";
import { useMemoCompare } from "@/memo";
import { line } from "@/vis/line/aether";

export interface LineProps extends Optional<Omit<line.State, "key">, "strokeWidth"> {}

export const Line = Aether.wrap<LineProps>(
  "Line",
  ({ aetherKey, ...props }): ReactElement | null => {
    const [, , setState] = Aether.use({
      aetherKey,
      type: line.Line.TYPE,
      schema: line.stateZ,
      initialState: props,
    });
    const memoProps = useMemoCompare(
      () => props,
      ([a], [b]) => Deep.equal(a, b),
      [props]
    );
    useLayoutEffect(() => setState(memoProps), [memoProps]);
    return null;
  }
);
