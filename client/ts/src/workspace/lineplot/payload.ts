// Copyright 2025 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { record } from "@synnaxlabs/x/record";
import { z } from "zod/v4";

import { parseWithoutKeyConversion } from "@/util/parseWithoutKeyConversion";

export const keyZ = z.string().uuid();
export type Key = z.infer<typeof keyZ>;
export type Params = Key | Key[];

export const linePlotZ = z.object({
  key: keyZ,
  name: z.string(),
  data: record.unknownZ.or(z.string().transform(parseWithoutKeyConversion)),
});
export interface LinePlot extends z.infer<typeof linePlotZ> {}

export const newZ = linePlotZ
  .partial({ key: true })
  .transform((p) => ({ ...p, data: JSON.stringify(p.data) }));
export interface New extends z.input<typeof newZ> {}

export const ONTOLOGY_TYPE = "lineplot";
export type OntologyType = typeof ONTOLOGY_TYPE;
