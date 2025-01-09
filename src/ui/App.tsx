import React from "react";
import Html from "./components/Html";

const App = () => {
  const [count, setCount] = React.useState(0);
  const [email, setEmail] = React.useState("");
  const [pass, setPass] = React.useState("");

  const submit = (type: "login" | "signup") => () => {
    const body = JSON.stringify({ email, password: pass });
    fetch(`/api/${type}`, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
      },
    }).then(console.log);
  };

  return (
    <Html>
      <h2>Count is {count}</h2>
      <button onClick={() => setCount((p) => p + 1)}>Increment</button>
      <button onClick={() => console.log("Hello from da button")}>Hello</button>

      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
      />
      <button onClick={submit("signup")}>Sign up</button>
      <button onClick={submit("login")}>Login</button>
    </Html>
  );
};

export default App;
