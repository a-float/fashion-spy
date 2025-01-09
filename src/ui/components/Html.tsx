const Html = (props: React.PropsWithChildren) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Fashion Spy</title>
    </head>
    <body>{props.children}</body>
  </html>
);

export default Html;
