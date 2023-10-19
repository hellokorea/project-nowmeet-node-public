import { ApiProperty } from "@nestjs/swagger";

export class ChatAllListResponseDto {
  @ApiProperty({ example: "1" })
  chatId: number;

  @ApiProperty({ example: "1" })
  matchId: number;

  @ApiProperty({ example: "2" })
  me: number;

  @ApiProperty({ example: "5" })
  matchUserId: number;

  @ApiProperty({ example: "PENDING 또는 OPEN" })
  chatStatus: string;
}