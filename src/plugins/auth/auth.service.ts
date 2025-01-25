import { db, table } from "db";
import { eq, InferSelectModel } from "drizzle-orm";
import {
  UsernameAlreadyTaken,
  IncorrectCredentials,
  UserInactive,
} from "./auth.errors";
import { createSelectSchema } from "drizzle-typebox";

const UserSchema = createSelectSchema(table.users);

export class AuthService {
  async login(body: { username: string; password: string }) {
    const user = await db.query.users.findFirst({
      where: eq(table.users.username, body.username),
    });
    if (!user || !(await Bun.password.verify(body.password, user.password))) {
      throw new IncorrectCredentials();
    }
    if (!user.isActive) throw new UserInactive();
    const key = crypto.getRandomValues(new Uint32Array(1))[0];
    await db.insert(table.sessions).values({
      id: key,
      userId: user.id,
    });
    return key;
  }

  async signUp(body: { username: string; password: string }) {
    const user = await db.query.users.findFirst({
      where: eq(table.users.username, body.username),
    });
    if (user) throw new UsernameAlreadyTaken();
    await db.insert(table.users).values({
      username: body.username,
      password: await Bun.password.hash(body.password),
    });
  }

  async getSession(sessionId: string) {
    return await db.query.sessions.findFirst({
      where: eq(table.sessions.id, parseInt(sessionId)),
      with: { user: true },
    });
  }

  async updateUser(id: number, data: Partial<typeof UserSchema.static>) {
    await db.update(table.users).set(data).where(eq(table.users.id, id));
  }

  async getAllUsers() {
    return await db.query.users.findMany({
      columns: { ...UserSchema, password: false },
    });
  }
}
