import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChatMessage } from "./chat.message.entity";

export enum ChatState {
  PENDING = "PENDING",
  OPEN = "OPEN",
}

@Entity()
export class DevChatRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  matchId: number;

  @Column()
  senderId: number;

  @Column()
  receiverId: number;

  @Column({ type: "enum", enum: ChatState, default: ChatState.PENDING })
  status: string;

  @OneToMany(() => ChatMessage, (message) => message.chatRoom)
  message: ChatMessage[];

  @CreateDateColumn()
  createdAt: string;
}
