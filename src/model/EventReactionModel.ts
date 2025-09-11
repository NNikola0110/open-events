import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from "typeorm";
import { Event } from "./eventModel";

@Entity()
@Unique(["visitorId", "event"])
export class EventReaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  visitorId!: string; // iz cookie-a

  @Column({ type: "enum", enum: ["like", "dislike"] })
  reactionType!: "like" | "dislike";

  @ManyToOne(() => Event, (event) => event.reactions, { onDelete: "CASCADE" })
  event!: Event;

  @CreateDateColumn()
  createdAt!: Date;
}
