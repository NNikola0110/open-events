import 'reflect-metadata';
import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  PrimaryGeneratedColumn,
  OneToMany,
  Unique
} from 'typeorm';
import { Event } from './eventModel';

@Entity()
@Unique(["name"])
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