import express, { Application } from 'express'; // Uvoz express-a i njegovih tipova
import userRoutes from './routes/usersRoutes';   // Uvoz ruta za korisnike
import adminRoutes from './routes/adminRoutes'; 
import cors from 'cors';
import { AppDataSource } from './db';
import emsCategoriesRoutes from './routes/emsCategoriesRoutes';
import eventToutes from './routes/eventRoutes';


AppDataSource.initialize()
  .then(() => {
    console.log("[TypeORM] Data Source has been initialized!");
    // Pokreni dalje logiku (npr. express server)
  })
  .catch((err) => {
    console.error("[TypeORM] Error during Data Source initialization:", err);
  });

const app: Application = express(); // Kreiramo instancu aplikacije
const PORT = 3000;                  // Definišemo port na kojem aplikacija radi


app.use(cors({
  origin:'*',
  methods:['GET','POST','PUT','DELETE','PATCH'],
  credentials:true
}));
// Middleware za parsiranje JSON-a
// Ovo omogućava da aplikacija razume JSON telo u zahtevima
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello World');
});
// Povezujemo korisničke rute
// Sve rute koje počinju sa "/users" preusmeravamo na userRoutes
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/ems', emsCategoriesRoutes);
app.use('/event', eventToutes);

// Pokretanje servera
app.listen(PORT, () => {
  console.log(`Server je pokrenut na http://localhost:${PORT}`);
});
