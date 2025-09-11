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
export class EventView {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  visitorId!: string; // iz cookie-a

  @ManyToOne(() => Event, (event) => event.views, { onDelete: "CASCADE" })
  event!: Event;

  @CreateDateColumn()
  createdAt!: Date;
}
