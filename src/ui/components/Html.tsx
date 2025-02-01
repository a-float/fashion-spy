import React from "react";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

type HtmlProps = {
  children?: React.ReactNode;
  styleLinks?: string[];
  /**
   * Necessary for correct styling before hydration.
   * Sets attribute on html like ColorSchemeScript does but without hydration error.
   */
  colorScheme: string;
};

const Html = (props: HtmlProps) => {
  return (
    <html lang="en" data-mantine-color-scheme={props.colorScheme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Fashion Spy</title>
        {props.styleLinks?.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
      </head>
      <body>{props.children}</body>
    </html>
  );
};

export default Html;
