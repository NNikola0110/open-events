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
  JoinColumn
} from 'typeorm';
import { User } from './userModel';
import { Event } from './eventModel';



@Entity()
@Unique(["user", "event"])
export class RSVP{

    @PrimaryGeneratedColumn()
    id!:number;

     @CreateDateColumn()
     registeredAt!: Date;

    @ManyToOne(()=>User, user => user.rsvc,{ onDelete: "CASCADE" })
    user!: User;

    
    @ManyToOne(() => Event, event => event.rsvps, { onDelete: "CASCADE" })
    event!: Event;



}