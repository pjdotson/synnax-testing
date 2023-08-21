// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { ReactElement } from "react";

import { OS } from "@synnaxlabs/x";

import { useOS } from "@/hooks";
import { MacOS } from "@/os/Controls/Mac";
import { OSControlsProps } from "@/os/Controls/types";
import { WindowsControls } from "@/os/Controls/Windows";

const Variants: Record<OS, React.FC<OSControlsProps>> = {
  MacOS,
  Windows: WindowsControls,
  Linux: WindowsControls,
  Docker: WindowsControls,
};

const DEFAULT_OS = "Windows";

export interface ControlsProps extends OSControlsProps {
  visibleIfOS?: OS;
}

export const Controls = ({
  forceOS,
  visibleIfOS,
  ...props
}: ControlsProps): ReactElement | null => {
  const os = useOS({ force: forceOS, default: DEFAULT_OS }) as OS;
  const C = Variants[os];
  if (visibleIfOS != null && visibleIfOS !== os) return null;
  return <C {...props} />;
};
