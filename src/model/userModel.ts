import 'reflect-metadata';
import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { RSVP } from './rsvpModel';

export type UserRole = "event_creator" | "admin";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  user_id!: string;

//  @BeforeInsert()
//  generateId() {
//    this.user_id = uuidv4();
//  }

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column()
  sername!: string;

  @Column({type:"enum", enum:["event_creator","admin"]})
  role!: UserRole;

  @Column()
  status!: boolean;
  
  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @OneToMany(()=>RSVP, rsvc => rsvc.user)
  rsvc!:RSVP[];

}
