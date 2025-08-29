import 'reflect-metadata';
import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  PrimaryGeneratedColumn,
  OneToMany
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Event } from './eventModel';

@Entity()
export class Category{

  @PrimaryGeneratedColumn()
  id!:number;

   @Column({ unique: true })
  name!: string;

  @Column()
  description!: string;

  @OneToMany(() => Event, event => event.category)
  events!: Event[];

}