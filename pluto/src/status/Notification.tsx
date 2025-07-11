// Copyright 2025 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import "@/status/Notification.css";

import { Icon } from "@synnaxlabs/media";
import { array } from "@synnaxlabs/x";
import { isValidElement, type ReactElement, useRef } from "react";

import { Align } from "@/align";
import { Button } from "@/button";
import { CSS } from "@/css";
import { type NotificationSpec } from "@/status/Aggregator";
import { Indicator } from "@/status/Indicator";
import { Text } from "@/text";

interface ActionProps {
  action: ReactElement | Button.ButtonProps;
}

const Action = ({ action }: ActionProps): ReactElement =>
  isValidElement(action) ? action : <Button.Button {...action} key={action.key} />;

export interface NotificationProps extends Align.SpaceProps {
  status: NotificationSpec;
  silence: (key: string) => void;
  actions?: ReactElement | Button.ButtonProps[];
}

export const Notification = ({
  status: { key, time, count, message, description, variant },
  silence,
  actions,
  className,
  children,
  ...rest
}: NotificationProps): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Align.Space
      className={CSS(CSS.B("notification"), className)}
      y
      key={time.toString()}
      empty
      ref={ref}
      {...rest}
    >
      <Align.Space x justify="spaceBetween" grow style={{ width: "100%" }}>
        <Align.Space x align="center" size="small">
          <Indicator style={{ height: "2.25rem", width: "2.5rem" }} variant={variant} />
          <Text.Text level="small" shade={11}>
            {`x${count}`}
          </Text.Text>
          <Text.DateTime
            className={CSS(CSS.BE("notification", "time"))}
            level="small"
            format="time"
          >
            {time}
          </Text.DateTime>
        </Align.Space>
        <Button.Icon
          className={CSS(CSS.BE("notification", "silence"))}
          variant="outlined"
          size="small"
          onClick={() => silence(key)}
        >
          <Icon.Close />
        </Button.Icon>
      </Align.Space>
      <Align.Space
        y
        align="start"
        className={CSS(CSS.BE("notification", "content"))}
        size="small"
      >
        {children != null ? (
          children
        ) : (
          <Text.Text
            className={CSS(CSS.BE("notification", "message"))}
            level="p"
            style={{ flexGrow: 1 }}
          >
            {message}
          </Text.Text>
        )}
        {description != null && (
          <Text.Text
            className={CSS(CSS.BE("notification", "description"))}
            level="small"
            style={{ flexGrow: 1 }}
          >
            {description}
          </Text.Text>
        )}
      </Align.Space>
      {actions != null && (
        <Align.Space
          x
          align="center"
          justify="end"
          className={CSS(CSS.BE("notification", "actions"))}
        >
          {array.toArray<ReactElement | Button.ButtonProps>(actions).map((a) => (
            <Action key={a.key} action={a} />
          ))}
        </Align.Space>
      )}
    </Align.Space>
  );
};
