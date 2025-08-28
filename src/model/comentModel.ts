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

@Entity()
export class Comment{

    @PrimaryGeneratedColumn()
    id!:number;

    @Column()
    text!: string;
}