import { Elysia, t } from "elysia";
import { AuthService } from "./auth.service";
import { createInsertSchema } from "drizzle-typebox";
import { table } from "db";

const _createUserSchema = createInsertSchema(table.users, {
  email: (schema) => t.String({ ...schema, minLength: 3 }),
  password: (schema) => t.String({ ...schema, minLength: 3 }),
});

const AuthModels = {
  signUp: t.Pick(_createUserSchema, ["email", "password"]),
  signIn: t.Pick(_createUserSchema, ["email", "password"]),
};

export const authPlugin = new Elysia()
  .get("/auth_test", () => "test")
  .state("AuthService", new AuthService())
  .model(AuthModels)
  // every ctx gets user
  .resolve({ as: "global" }, async ({ cookie: { token }, store }) => {
    if (!token.value) return { user: null };
    const session = await store.AuthService.getSession(token.value);
    if (!session) token.remove();
    return { user: session?.user ?? null };
  })
  // require user to be present
  .macro({
    isLoggedIn: (_enabled: true) => ({
      resolve: ({ user, set }) => {
        if (user) return { user };
        throw (set.status = "Unauthorized");
      },
    }),
  })
  .group("/api", (app) =>
    app
      .post(
        "/signup",
        async ({ body, store }) => {
          await store.AuthService.signUp(body);
          return { ok: true };
        },
        { body: "signUp" }
      )
      .post(
        "/login",
        async ({ cookie: { token }, body, store, user }) => {
          if (!user) {
            const key = await store.AuthService.login(body);
            token.value = key.toString();
          }
          return { ok: true };
        },
        { body: "signIn" }
      )
      .get("/logout", async ({ cookie: { token } }) => {
        if (token) token.remove();
        return { ok: true };
      })
      .get("/profile", ({ user }) => {
        return user ? { email: user.email } : null;
      })
  );
