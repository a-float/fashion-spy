import { db, table } from "db";
import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";
import { Value } from "@sinclair/typebox/value";

const userModel = t.Object({
  id: t.Number(),
  email: t.String({ minLength: 1 }),
  password: t.String({ minLength: 1 }),
});

const publicUser = t.Nullable(t.Pick(userModel, ["email"]));

const userModels = {
  signUp: t.Pick(userModel, ["email", "password"]),
  signIn: t.Pick(userModel, ["email", "password"]),
};

const getUser = new Elysia()
  .resolve(async ({ cookie: { token } }) => {
    if (!token.value) return { user: null };
    const session = await db.query.sessions.findFirst({
      where: eq(table.sessions.id, parseInt(token.value)),
      with: {
        user: true,
      },
    });
    if (!session) token.remove();
    return { user: session?.user ?? null };
  })
  .as("global");

export const getUserMacro = new Elysia().use(getUser).macro({
  isLoggedIn: (_enabled: true) => ({
    resolve: ({ user }) => {
      if (!user) throw new Error("No user");
      return { user };
    },
  }),
});

export const authPlugin = new Elysia({ name: "auth" })
  .model(userModels)
  .use(getUser)
  .group("/api", (app) =>
    app
      .post(
        "/signup",
        async ({ body, error }) => {
          const user = await db.query.users.findFirst({
            where: eq(table.users.email, body.email),
          });
          if (user) return error(400, "Email already taken");
          await db.insert(table.users).values({
            email: body.email,
            password: await Bun.password.hash(body.password),
          });
        },
        { body: "signUp" }
      )
      .post(
        "/login",
        async ({ cookie: { token }, body, error, user: auth }) => {
          if (auth) return error(400, "Already logged in");
          const user = await db.query.users.findFirst({
            where: eq(table.users.email, body.email),
          });
          if (
            !user ||
            !(await Bun.password.verify(body.password, user.password))
          )
            return error(400, "Bad Request");
          const key = crypto.getRandomValues(new Uint32Array(1))[0];
          await db.insert(table.sessions).values({
            id: key,
            userId: user.id,
          });
          token.value = key.toString();
        },
        { body: "signIn" }
      )
      .post("/logout", async ({ cookie: { token } }) => {
        if (token) token.remove();
        return "ok";
      })
      .get("/profile", ({ user }) => {
        return Value.Cast(publicUser, user);
      })
  );
