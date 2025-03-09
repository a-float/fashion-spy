import { Text, TextProps } from "@mantine/core";

const Logo = (props: TextProps) => (
  <Text
    component="span"
    fw={900}
    variant="gradient"
    gradient={{ from: "blue", to: "grape", deg: 145 }}
    {...props}
    style={{ whiteSpace: "pre", ...props.style }}
  >
    Fashion Spy
  </Text>
);

export default Logo;
