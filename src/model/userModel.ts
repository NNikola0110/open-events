import 'reflect-metadata';
import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class User {
  @PrimaryColumn()
  user_id!: string;

  @BeforeInsert()
  generateId() {
    this.user_id = uuidv4();
  }

  @Column()
  email!: string;

  @Column()
  name!: string;

  @Column()
  sername!: string;

  @Column()
  tupe!: string;

  @Column()
  status!: string;

  @Column()
  password!: string;
}
