// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { forwardRef, ReactElement } from "react";

import clsx from "clsx";

import { BaseButtonProps } from "./Button";

/** The props for the {@link ButtonIcon} */
export interface ButtonIconProps extends BaseButtonProps {
  children: ReactElement;
}

export const ButtonIcon = forwardRef<HTMLButtonElement, ButtonIconProps>(
  (
    { children, className, variant = "text", size = "medium", ...props },
    ref
  ): JSX.Element => (
    <button
      ref={ref}
      className={clsx(
        "pluto-btn pluto-btn-icon",
        "pluto--" + size,
        "pluto-btn--" + variant,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
ButtonIcon.displayName = "ButtonIcon";
