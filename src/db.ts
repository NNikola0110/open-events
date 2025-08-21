import { DataSource } from "typeorm";
import { User } from "./model/userModel";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "127.0.0.1",
  port: 3306,
  username: "root",          // tvoj MySQL korisnik
  password: "root", // lozinka za MySQL
  database: "eventbooker",   // ime baze
  synchronize: true,
  logging: true,
  entities: [User],          // dodaj i ostale entitete
});
