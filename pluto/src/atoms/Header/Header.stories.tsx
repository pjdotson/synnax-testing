import type { ComponentMeta, ComponentStory } from "@storybook/react";
import { AiOutlinePlus } from "react-icons/ai";
import { MdGrain } from "react-icons/md";

import { TypographyLevels } from "../Typography";

import { HeaderProps } from "./Header";

import { Header } from ".";

const story: ComponentMeta<typeof Header> = {
  title: "Atoms/Header",
  component: Header,
  argTypes: {
    level: {
      control: { type: "select" },
      options: TypographyLevels,
    },
    icon: {
      control: { type: "json" },
    },
  },
};

const Template: ComponentStory<typeof Header> = (args: HeaderProps) => (
  <Header {...args} />
);

export const Primary = Template.bind({});
Primary.args = {
  icon: <MdGrain />,
  children: "Heading",
  level: "p",
  divided: true,
  actions: [{ children: <AiOutlinePlus />, variant: "text" }],
};

export default story;
