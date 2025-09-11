import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from "typeorm";
import { Comment } from "./comentModel";

@Entity()
@Unique(["visitorId", "comment"])
export class CommentReaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  visitorId!: string; // iz cookie-a

  @Column({ type: "enum", enum: ["like", "dislike"] })
  reactionType!: "like" | "dislike";

  @ManyToOne(() => Comment, (comment) => comment.reactions, { onDelete: "CASCADE" })
  comment!: Comment;

  @CreateDateColumn()
  createdAt!: Date;
}
