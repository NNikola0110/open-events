import { DataSource } from "typeorm";
import { User } from "./model/userModel";
import { Category } from "./model/categoriModel";
import { RSVP } from "./model/rsvpModel";
import { Tag } from "./model/tagModel";
import { Comment } from "./model/comentModel";
import { Event } from "./model/eventModel";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "127.0.0.1",
  port: 3306,
  username: "root",          // tvoj MySQL korisnik
  password: "root", // lozinka za MySQL
  database: "eventbooker",   // ime baze
  synchronize: true,
  logging: true,
  entities: [User,Category,Comment,Event,RSVP,Tag],          // dodaj i ostale entitete
});
