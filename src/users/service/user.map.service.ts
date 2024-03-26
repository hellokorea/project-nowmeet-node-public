import { BadRequestException, Injectable } from "@nestjs/common";
import { UsersRepository } from "../database/repository/users.repository";
import { AwsService } from "src/aws.service";
import { UserRequestDto } from "../dtos/request/users.request.dto";
import { UserProfileResponseDto } from "../dtos/response/user.profile.dto";
import { GhostModeDto } from "../dtos/request/user.ghostMode.dto";
import { RecognizeService } from "src/recognize/recognize.service";
import { MatchProfileService } from "src/match/service/match.profile.service";

@Injectable()
export class UserMapService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly awsService: AwsService,
    private readonly recognizeService: RecognizeService,
    private readonly matchProfileService: MatchProfileService
  ) {}

  async refreshUserLocation(lon: string, lat: string, req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.recognizeService.validateUser(loggedId);

    const lonString = parseFloat(lon).toFixed(7);
    const latString = parseFloat(lat).toFixed(7);

    const lonNumber = parseFloat(lonString);
    const latNumber = parseFloat(latString);

    if (isNaN(lonNumber) || isNaN(latNumber)) {
      throw new BadRequestException("유효하지 않는 좌표 값입니다.");
    }

    if (lonNumber < -180 || lonNumber > 180 || latNumber < -90 || latNumber > 90) {
      throw new BadRequestException("경도 및 위도의 범위가 올바르지 않습니다. -180 < lon < 180 / -90 < lan < 90");
    }

    try {
      const findMyLocation = await this.usersRepository.findOneUserLocation(user.id);

      if (!findMyLocation) {
        user.longitude = lonNumber;
        user.latitude = latNumber;
      }

      const refreshLocation = await this.usersRepository.refreshUserLocation(user.id, lonNumber, latNumber);

      const SEARCH_BOUNDARY = Number(process.env.SEARCH_BOUNDARY);

      const nearbyUsers = await this.usersRepository.findUsersNearLocaction(lonNumber, latNumber, SEARCH_BOUNDARY);

      console.log("주변 유저", nearbyUsers);
      const responseUserPromises = nearbyUsers.map(async (user) => {
        const nearbyUsersMatchStatus = await this.matchProfileService.getMatchStatus(user.id, loggedId);
        const userInfo = new UserProfileResponseDto(user);

        userInfo.matchStatus = nearbyUsersMatchStatus;

        return userInfo;
      });

      const responseUserList = await Promise.all(responseUserPromises);

      const filteredResponseUserList = responseUserList.filter(
        (responseUser) =>
          user.nickname !== responseUser.nickname && responseUser.ghostMode === false && user.sex !== responseUser.sex
      );

      console.log(filteredResponseUserList);

      if (!filteredResponseUserList.length) {
        return null;
      }

      const profilesKey = filteredResponseUserList.map((users) => users.profileImages);
      const preSignedUrl = await this.awsService.createPreSignedUrl(profilesKey.flat());

      let currentIndex = 0;

      filteredResponseUserList.forEach((user) => {
        const numProfileImages = user.profileImages.length;
        const userUrls = preSignedUrl.slice(currentIndex, currentIndex + numProfileImages);

        user.PreSignedUrl = userUrls;
        currentIndex += numProfileImages;
      });

      return {
        myId: user.id,
        myLongitude: refreshLocation.longitude,
        myLatitude: refreshLocation.latitude,
        nearbyUsers: filteredResponseUserList,
      };
    } catch (e) {
      console.error("refreshLocation error :", e);
      throw new BadRequestException("위치 정보를 갱신하는 중 오류가 발생했습니다.");
    }
  }

  async putGhostMode(setting: GhostModeDto, req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.recognizeService.validateUser(loggedId);

    try {
      setting ? (user.ghostMode = true) : (user.ghostMode = false);
      const ghostSetting = await this.usersRepository.saveUser(user);

      return ghostSetting.ghostMode;
    } catch (e) {
      console.error("putGhostMode error :", e);
      throw new BadRequestException("유령 모드 변경에 실패했습니다.");
    }
  }
}