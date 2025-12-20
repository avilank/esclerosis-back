import * as bcrypt from 'bcrypt';
export class BcryptUtils {
  static async hashPassword(password: string) {
    return await bcrypt.hash(password, 12);
  }

  static async comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
}
