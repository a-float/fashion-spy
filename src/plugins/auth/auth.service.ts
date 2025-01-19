import { db, table } from "db";
import { eq } from "drizzle-orm";
import { EmailAlreadyTaken, IncorrectCredentials } from "./auth.errors";

export class AuthService {
  async login(body: { email: string; password: string }) {
    const user = await db.query.users.findFirst({
      where: eq(table.users.email, body.email),
    });
    if (!user || !(await Bun.password.verify(body.password, user.password)))
      throw new IncorrectCredentials();
    const key = crypto.getRandomValues(new Uint32Array(1))[0];
    await db.insert(table.sessions).values({
      id: key,
      userId: user.id,
    });
    return key;
  }

  async signUp(body: { email: string; password: string }) {
    const user = await db.query.users.findFirst({
      where: eq(table.users.email, body.email),
    });
    if (user) throw new EmailAlreadyTaken();
    await db.insert(table.users).values({
      email: body.email,
      password: await Bun.password.hash(body.password),
    });
  }

  async getSession(sessionId: string) {
    return await db.query.sessions.findFirst({
      where: eq(table.sessions.id, parseInt(sessionId)),
      with: { user: true },
    });
  }
}
