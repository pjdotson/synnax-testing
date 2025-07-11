// Copyright 2025 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { Icon } from "@synnaxlabs/media";
import {
  Align,
  Button,
  Color,
  Diagram,
  Form,
  Input,
  Schematic,
  Status,
} from "@synnaxlabs/pluto";
import { box, color, location, xy } from "@synnaxlabs/x";
import { memo, type ReactElement } from "react";
import { useDispatch, useStore } from "react-redux";

import {
  type ElementInfo,
  selectViewport,
  useSelectRequiredEdge,
  useSelectRequiredNodeProps,
  useSelectSelectedElementDigests,
  useSelectSelectedElementsProps,
} from "@/schematic/selectors";
import { setElementProps, setNodePositions } from "@/schematic/slice";
import { type EdgeProps, type NodeProps } from "@/schematic/types";
import { type nodePropsZ } from "@/schematic/types/v0";
import { type RootState } from "@/store";

export interface PropertiesProps {
  layoutKey: string;
}

export const PropertiesControls = memo(
  ({ layoutKey }: PropertiesProps): ReactElement => {
    const digests = useSelectSelectedElementDigests(layoutKey);
    if (digests.length === 0)
      return (
        <Status.Text.Centered variant="disabled" hideIcon>
          Select a Schematic element to configure its properties.
        </Status.Text.Centered>
      );

    if (digests.length > 1) return <MultiElementProperties layoutKey={layoutKey} />;

    const selected = digests[0];

    if (selected.type === "edge")
      return <EdgeProperties layoutKey={layoutKey} edgeKey={selected.key} />;
    return (
      <IndividualProperties
        key={selected.key}
        layoutKey={layoutKey}
        nodeKey={selected.key}
      />
    );
  },
);
PropertiesControls.displayName = "PropertiesControls";

interface IndividualPropertiesProps {
  layoutKey: string;
  nodeKey: string;
}

const IndividualProperties = ({
  layoutKey,
  nodeKey,
}: IndividualPropertiesProps): ReactElement | null => {
  const props = useSelectRequiredNodeProps(layoutKey, nodeKey);
  const C = Schematic.SYMBOLS[props.key];
  const dispatch = useDispatch();

  const onChange = (key: string, props: NodeProps): void => {
    dispatch(setElementProps({ layoutKey, key, props }));
  };

  const formMethods = Form.use<typeof nodePropsZ>({
    values: structuredClone(props),
    sync: true,
    onChange: ({ values }) => onChange(nodeKey, values),
  });

  return (
    <Align.Space style={{ height: "100%" }} y>
      <Form.Form<typeof nodePropsZ> {...formMethods}>
        <C.Form {...formMethods} key={nodeKey} />
      </Form.Form>
    </Align.Space>
  );
};

interface EdgePropertiesProps {
  layoutKey: string;
  edgeKey: string;
}

const EdgeProperties = ({
  layoutKey,
  edgeKey,
}: EdgePropertiesProps): ReactElement | null => {
  const edge = useSelectRequiredEdge(layoutKey, edgeKey);
  const dispatch = useDispatch();
  const onChange = (key: string, props: Partial<EdgeProps>): void => {
    dispatch(setElementProps({ layoutKey, key, props }));
  };
  return (
    <Align.Space style={{ padding: "2rem" }} align="start" x>
      <Input.Item label="Color" align="start">
        <Color.Swatch
          value={edge.color ?? color.ZERO}
          onChange={(v: color.Color) => {
            onChange(edge.key, { color: color.hex(v) });
          }}
        />
      </Input.Item>
      <Input.Item label="Type" align="start">
        <Diagram.SelectPathType
          value={edge.variant as Diagram.PathType}
          onChange={(variant: Diagram.PathType) => onChange(edge.key, { variant })}
        />
      </Input.Item>
    </Align.Space>
  );
};

interface MultiElementPropertiesProps {
  layoutKey: string;
}

const MultiElementProperties = ({
  layoutKey,
}: MultiElementPropertiesProps): ReactElement => {
  const handleError = Status.useErrorHandler();
  const elements = useSelectSelectedElementsProps(layoutKey);
  const dispatch = useDispatch();
  const onChange = (key: string, props: Partial<NodeProps>): void => {
    dispatch(setElementProps({ layoutKey, key, props }));
  };

  const colorGroups: Record<string, ElementInfo[]> = {};
  elements.forEach((e) => {
    let colorVal: color.Color | null = null;
    if (e.type === "edge") colorVal = color.construct(e.edge.color);
    else if (e.props.color != null) colorVal = color.construct(e.props.color);
    if (colorVal === null) return;
    const hex = color.hex(colorVal);
    if (!(hex in colorGroups)) colorGroups[hex] = [];
    colorGroups[hex].push(e);
  });

  const store = useStore<RootState>();

  const getLayouts = () => {
    const viewport = selectViewport(store.getState(), layoutKey);
    return elements
      .map((el) => {
        if (el.type !== "node") return null;
        // grab all child elements with the class 'react-flow__handle'
        try {
          const nodeEl = Diagram.selectNode(el.key);
          const nodeBox = box.construct(
            el.node.position,
            box.dims(box.construct(nodeEl)),
          );
          const handleEls = nodeEl.getElementsByClassName("react-flow__handle");
          const nodeElBox = box.construct(nodeEl);
          const handles = Array.from(handleEls).map((el) => {
            const pos = box.center(box.construct(el));
            const dist = xy.scale(
              xy.translation(box.topLeft(nodeElBox), pos),
              1 / (viewport?.zoom ?? 1),
            );
            const match = el.className.match(/react-flow__handle-(\w+)/);
            if (match == null)
              throw new Error(`[schematic] - cannot find handle orientation`);
            const orientation = location.construct(match[1]) as location.Outer;
            return new Diagram.HandleLayout(dist, orientation);
          });
          return new Diagram.NodeLayout(el.key, nodeBox, handles);
        } catch (e) {
          handleError(e, "failed to calculate schematic node layout");
        }
        return null;
      })
      .filter((el) => el !== null);
  };

  return (
    <Align.Space align="start" x style={{ padding: "2rem" }}>
      <Input.Item label="Selection Colors" align="start">
        <Align.Space y>
          {Object.entries(colorGroups).map(([hex, elements]) => (
            <Color.Swatch
              key={elements[0].key}
              value={hex}
              onChange={(v: color.Color) => {
                elements.forEach((e) => onChange(e.key, { color: color.hex(v) }));
              }}
            />
          ))}
        </Align.Space>
      </Input.Item>
      <Input.Item label="Align">
        <Align.Space x>
          <Button.Icon
            tooltip="Align nodes vertically"
            onClick={() => {
              const newPositions = Diagram.alignNodes(getLayouts(), "x");
              dispatch(
                setNodePositions({
                  key: layoutKey,
                  positions: Object.fromEntries(
                    newPositions.map((n) => [n.key, box.topLeft(n.box)]),
                  ),
                }),
              );
            }}
          >
            <Icon.Align.YCenter />
          </Button.Icon>
          <Button.Icon
            tooltip="Align nodes horizontally"
            onClick={() => {
              const newPositions = Diagram.alignNodes(getLayouts(), "y");
              dispatch(
                setNodePositions({
                  key: layoutKey,
                  positions: Object.fromEntries(
                    newPositions.map((n) => [n.key, box.topLeft(n.box)]),
                  ),
                }),
              );
            }}
          >
            <Icon.Align.XCenter />
          </Button.Icon>
        </Align.Space>
      </Input.Item>
    </Align.Space>
  );
};
