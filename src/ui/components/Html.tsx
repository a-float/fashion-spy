import React from "react";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

type HtmlProps = {
  children?: React.ReactNode;
  styleLinks?: string[];
};

const Html = (props: HtmlProps) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Fashion Spy</title>
        {/* <ColorSchemeScript /> */}
        {props.styleLinks?.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
      </head>
      <body>{props.children}</body>
    </html>
  );
};

export default Html;
