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
import { Tag } from './tagModel';
import { RSVP } from './rsvpModel';

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

    @Column()
    creator!:string;

    @ManyToMany(() => Tag, tag => tag.events, { cascade: true })
    tags!: Tag[];

    @Column()
    category!: string;

    @Column({ nullable: true })
    maxCapacity!: number;

    @OneToMany(() => RSVP, (rsvp) => rsvp.event)
    rsvps!: RSVP[];
}