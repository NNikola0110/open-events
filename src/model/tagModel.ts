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

@Entity()
export class Tag{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    tagName!:string;

    @ManyToMany(() => Event, event => event.tags)
    events!: Event[];
}