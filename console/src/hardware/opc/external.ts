// Copyright 2024 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { Layout } from "@/layout";

export * from "@/hardware/opc/device";
export * from "@/hardware/opc/palette";
export * from "@/hardware/opc/task";
import { Device } from "@/hardware/opc/device";
import { Task } from "@/hardware/opc/task";

export const LAYOUTS: Record<string, Layout.Renderer> = {
  ...Device.LAYOUTS,
  ...Task.LAYOUTS,
};

export const SELECTABLES: Layout.Selectable[] = Task.SELECTABLES;
