import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Match } from "../entity/match.entity";
import { EntityManager, FindOneOptions, LessThan, Repository } from "typeorm";
import { DevMatch } from "../entity/match.dev.entity";
import * as moment from "moment-timezone";

@Injectable()
export class MatchRepository {
  constructor(
    @InjectRepository(Match) private matchRepository: Repository<Match>,
    @InjectRepository(DevMatch) private devMatchRepository: Repository<DevMatch>
  ) {}

  //*---Find Logic
  async findOneMatchById(matchId: number): Promise<Match> {
    const option: FindOneOptions<Match> = {
      where: { id: matchId },
      relations: ["receiver", "sender"],
    };
    return await this.matchRepository.findOne(option);
  }

  async isMatchFind(senderId: number, receiverId: number): Promise<Match[] | null> {
    return await this.matchRepository.find({
      where: {
        sender: { id: senderId },
        receiver: { id: receiverId },
      },
    });
  }

  async findOneMatchByUserIds(profileId: number, loggedId: number): Promise<Match | null> {
    const option: FindOneOptions<Match> = {
      where: [
        { sender: { id: loggedId }, receiver: { id: profileId } },
        { sender: { id: profileId }, receiver: { id: loggedId } },
      ],
    };
    return await this.matchRepository.findOne(option);
  }

  async findExpiredMatches(): Promise<Match[]> {
    const currentKoreaTime = moment().tz("Asia/Seoul").toDate();
    return this.matchRepository.find({ where: { expireMatch: LessThan(currentKoreaTime) } });
  }

  async getSendMatches(userId: number): Promise<Match[]> {
    return await this.matchRepository.find({ where: { sender: { id: userId } }, relations: ["receiver"] });
  }

  async getReceiveMatches(userId: number): Promise<Match[]> {
    return await this.matchRepository.find({ where: { receiver: { id: userId } }, relations: ["sender"] });
  }

  //*---Create Logic
  async createMatch(senderId: number, receiverId: number): Promise<Match> {
    const PROD_TIMER: number = 24 * 60 * 60 * 1000;
    const TEST_TIMER: number = 120 * 1000;

    const expireMatch = moment().add(PROD_TIMER, "milliseconds").tz("Asia/Seoul").toDate();

    const newMatch = this.matchRepository.create({
      sender: { id: senderId },
      receiver: { id: receiverId },
      expireMatch,
    });
    return await this.matchRepository.save(newMatch);
  }

  //*---Save Logic
  async saveMatch(match: Match): Promise<Match> {
    return await this.matchRepository.save(match);
  }

  //*---Delete Logic
  async removeExpireMatch(match: Match): Promise<void> {
    await this.matchRepository.remove(match);
  }

  //*---Dev Logic
  async findOneDevMatchById(matchId: number): Promise<DevMatch> {
    const option: FindOneOptions<DevMatch> = {
      where: { id: matchId },
      relations: ["receiver", "sender"],
    };
    return await this.devMatchRepository.findOne(option);
  }

  async createDevMatch(senderId: number, receiverId: number): Promise<DevMatch> {
    const newMatch = this.devMatchRepository.create({
      sender: { id: senderId },
      receiver: { id: receiverId },
    });
    return await this.devMatchRepository.save(newMatch);
  }

  async saveDevMatch(match: DevMatch): Promise<DevMatch> {
    return await this.devMatchRepository.save(match);
  }

  //*---Delete Account Logic
  async deleteMatchesByUserId(txManager: EntityManager, userId: number): Promise<void> {
    const matchRepository = txManager.getRepository(Match);
    const matches = await matchRepository.find({
      where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
    });
    await matchRepository.remove(matches);
  }

  async deleteDevMatchesByUserId(txManager: EntityManager, userId: number): Promise<void> {
    const devMatchRepository = txManager.getRepository(DevMatch);
    const matches = await devMatchRepository.find({
      where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
    });
    await devMatchRepository.remove(matches);
  }
}
