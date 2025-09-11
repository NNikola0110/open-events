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
  Index
} from 'typeorm';
import { User } from './userModel';
import { Event } from './eventModel';



@Entity()
@Unique(["user", "event"])
@Unique('UQ_RSVP_GUEST_EVENT', ['guestEmail', 'event'])
export class RSVP{

    @PrimaryGeneratedColumn()
    id!:number;

     @CreateDateColumn()
     registeredAt!: Date;

    @ManyToOne(()=>User, user => user.rsvc,{ onDelete: "CASCADE" })
    user!: User;

    
    @ManyToOne(() => Event, event => event.rsvps, { onDelete: "CASCADE" })
    event!: Event;

@Column({ type: 'varchar', length: 191, nullable: true })
guestName?: string;

@Column({ type: 'varchar', length: 191, nullable: true })
guestEmail?: string;

@Column({ type: 'varchar', length: 191, nullable: true })
visitorId?: string;

}