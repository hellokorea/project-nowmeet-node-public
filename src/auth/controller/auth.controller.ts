import { Controller, Get, UseInterceptors, Request, Response, Post, UseGuards, Req, Res, Body } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { SuccessInterceptor } from "src/common/interceptors/success.interceptor";
import { AuthService } from "../service/auth.service";
import { GoogleRequest } from "../dtos/request/auth.googleuser.dto";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { IsUserRequsetDto } from "../dtos/response/auth.isUser.dto";
import { JwtAuthGuard } from "../jwt/jwt.guard";

@Controller("auth")
@UseInterceptors(SuccessInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //-----------------Google Login Logic
  @ApiOperation({ summary: "구글 (사용 X)" })
  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleLogin(@Req() req: Request) {}

  @ApiOperation({ summary: "구글 로그인 (사용 X)" })
  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  googleLoginCallback(@Req() req: GoogleRequest) {
    return this.authService.googleLogin(req);
  }

  @ApiResponse({
    description: "유저 => true / 유저 X => false",
    type: Boolean,
  })
  @ApiOperation({ summary: "로그인 시 유저 검증" })
  @ApiBody({ description: "이메일 정보 입력", type: IsUserRequsetDto })
  @Post("isUser")
  isUserExist(@Body("email") email: string) {
    return this.authService.isUserExist(email);
  }

  @ApiOperation({ summary: "구글 id_token 발행" })
  @ApiBody({ description: "code 입력", type: String })
  @Post("getRefreshToken/google")
  makeNewIdTokenGoogle(@Body("code") code: string) {
    return this.authService.makeNewIdTokenGoogle(code);
  }

  @ApiOperation({ summary: "애플 id_token 발행" })
  @ApiBody({ description: "Authcode 입력", type: String })
  @Post("getRefreshToken/apple")
  makeNewIdTokenApple(@Body("authCode") authCode: string) {
    return this.authService.makeNewIdTokenApple(authCode);
  }

  @Post("createClientAppleSecret")
  createSecretKeyApple() {
    return this.authService.createSecretKeyApple();
  }
}
