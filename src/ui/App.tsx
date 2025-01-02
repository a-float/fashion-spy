import React from "react";

const App = () => {
  const [count, setCount] = React.useState(0);

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/styles.css"></link>
        <title>Fashion Spy</title>
      </head>
      <body>
        <h2>Count is {count}</h2>
        <button onClick={() => setCount((p) => p + 1)}>Increment</button>
        <button onClick={() => console.log("Hello from da button")}>
          Hello
        </button>
      </body>
    </html>
  );
};

export default App;
