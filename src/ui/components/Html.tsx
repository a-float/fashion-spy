import React from "react";
import { ColorSchemeScript } from "@mantine/core";

type HtmlProps = {
  children?: React.ReactNode;
  styles?: React.ReactNode;
};

const Html = (props: HtmlProps) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Fashion Spy</title>
        <link rel="stylesheet" href="/public/styles.css"></link>
        {/* <ColorSchemeScript /> */}
        {props.styles}
      </head>
      <body>{props.children}</body>
    </html>
  );
};

export default Html;
