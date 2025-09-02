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
  ManyToMany,
  JoinTable
  
} from 'typeorm';
import { Tag } from './tagModel';
import { RSVP } from './rsvpModel';
import { User } from './userModel';
import { Category } from './categoriModel';
import { Comment } from './comentModel';

@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column("text")
    description!: string;

    @CreateDateColumn()
     createDate!: Date;

    @Column()
    eventstartDate!: Date;

    @Column()
    location!:string;

    @Column({ default: 0 })
    numberOfViews!:number;

    @ManyToOne(()=>User, creator=>creator.events)
    creator!:User;

    @ManyToMany(() => Tag, tag => tag.events, { cascade: true })
    @JoinTable()
    tags!: Tag[];

    @Column({ nullable: true })
    maxCapacity?: number;

    @OneToMany(() => RSVP, (rsvp) => rsvp.event)
    rsvps!: RSVP[];

    @ManyToOne(() => Category, category => category.events)
    category!: Category;

     @OneToMany(() => Comment, comment => comment.event, { cascade: true })
    comment!: Comment[];

     @Column({ default: 0 })
     likeCount!: number;

    @Column({ default: 0 })
    dislikeCount!: number;
}