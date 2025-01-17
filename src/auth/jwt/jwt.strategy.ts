import { Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ApplePayload, GooglePayload } from "./jwt.payload";
import { UsersRepository } from "src/users/database/repository/users.repository";
import { User } from "src/users/database/entity/users.entity";
import * as jwksRsa from "jwks-rsa";

// Google Jwt Validate
@Injectable()
export class GooleJwtStrategy extends PassportStrategy(Strategy, "google-jwt") {
  constructor(private readonly userRepository: UsersRepository) {
    const isDevMode = process.env.MODE === "dev";

    const strategyOptions = isDevMode
      ? {
          // dev
          jwtFromRequest: (request) => {
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
              throw new UnauthorizedException("Invalid Authorization header");
            }
            const token = authHeader.split(" ")[1];
            return token;
          },
          secretOrKey: process.env.JWT_KEY,
          ignoreExpiration: false,
        }
      : {
          // prod
          jwtFromRequest: (request) => {
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
              throw new UnauthorizedException("Invalid Authorization header");
            }
            const token = authHeader.split(" ")[1];
            return token;
          },
          secretOrKeyProvider: jwksRsa.passportJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 10,
            jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
          }),
          ignoreExpiration: false,
          issuer: "https://accounts.google.com",
          audience: process.env.GOOGLE_WEB_CLIENTID,
          algorithms: ["RS256"],
        };

    super(strategyOptions);
  }

  async validate(payload: GooglePayload): Promise<User> {
    try {
      const user = await this.userRepository.findOneGetByEmail(payload.email);

      if (!user) {
        throw new UnauthorizedException("유저가 존재하지 않습니다.");
      }

      return user;
    } catch (e) {
      console.error("googleJwtValidate :", e);
      throw new UnauthorizedException("구글 유저 인증 실패");
    }
  }
}

// Apple Jwt Validate
@Injectable()
export class AppleJwtStrategy extends PassportStrategy(Strategy, "apple-jwt") {
  constructor(private readonly userRepository: UsersRepository) {
    super({
      jwtFromRequest: (request) => {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          throw new UnauthorizedException("Invalid Authorization header");
        }
        const token = authHeader.split(" ")[1];

        return token;
      },
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: "https://appleid.apple.com/auth/oauth2/v2/keys",
      }),
      ignoreExpiration: false,
      issuer: "https://appleid.apple.com",
      audience: process.env.APPLE_CLIENT_ID,
      algorithms: ["RS256"],
    });
  }

  async validate(payload: ApplePayload): Promise<User> {
    try {
      const user = await this.userRepository.findOneAppleSub(payload.sub);

      if (!user) {
        throw new UnauthorizedException("유저가 존재하지 않습니다.");
      }

      return user;
    } catch (e) {
      console.error("AppleJwtValidate :", e);
      throw new UnauthorizedException("애플 유저 인증 실패");
    }
  }
}
