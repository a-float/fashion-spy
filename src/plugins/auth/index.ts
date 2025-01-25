import { Elysia, t } from "elysia";
import { AuthService } from "./auth.service";
import { createInsertSchema } from "drizzle-typebox";
import { table } from "db";

const _createUserSchema = createInsertSchema(table.users, {
  username: (schema) => t.String({ ...schema, minLength: 1 }),
  password: (schema) => t.String({ ...schema, minLength: 1 }),
});

const AuthModels = {
  signUp: t.Pick(_createUserSchema, ["username", "password"]),
  signIn: t.Pick(_createUserSchema, ["username", "password"]),
  updateUser: t.Optional(
    t.Pick(_createUserSchema, ["isActive", "maxItems", "isAdmin"])
  ),
};

export const authPlugin = new Elysia()
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
    isAdmin: (_enabled: true) => ({
      resolve: ({ user, set }) => {
        if (user && user.isAdmin === 1) return { user };
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
        return user ? { username: user.username } : null;
      })
      .get("/users", ({ store }) => store.AuthService.getAllUsers(), {
        isAdmin: true,
      })
      .put(
        "/user/:id",
        async ({ params: { id }, body, store }) => {
          await store.AuthService.updateUser(id, body);
          return { ok: true };
        },
        {
          isAdmin: true,
          params: t.Object({ id: t.Number() }),
          body: "updateUser",
        }
      )
  );
