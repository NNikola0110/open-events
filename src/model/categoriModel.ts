import 'reflect-metadata';
import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  PrimaryGeneratedColumn
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Category{

  @PrimaryGeneratedColumn()
  id!:number;

   @Column()
    text!: string;

}