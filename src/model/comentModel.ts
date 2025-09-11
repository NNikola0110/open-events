import 'reflect-metadata';
import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  PrimaryGeneratedColumn,
  OneToMany,
  Unique,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  ManyToMany
} from 'typeorm';
import { Event } from './eventModel';
import { CommentReaction } from './CommentReactionModel';

@Entity()
export class Comment{

  @PrimaryGeneratedColumn()
  id!:number;

  @Column()
  authorName!: string;

  @Column("text")
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Event, event => event.comment, { onDelete: "CASCADE" })
  event!: Event;

  @Column({ default: 0 })
  likeCount!: number;

  @Column({ default: 0 })
  dislikeCount!: number;

  @OneToMany(() => CommentReaction, (reaction) => reaction.comment)
  reactions!: CommentReaction[];

}