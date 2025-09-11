import express, { Application } from 'express'; // Uvoz express-a i njegovih tipova
import userRoutes from './routes/usersRoutes';   // Uvoz ruta za korisnike
import adminRoutes from './routes/adminRoutes'; 
import publicRoutes from './routes/publicRoutes';
import rsvpRoutes from './routes/rsvpRoutes';
import cors from 'cors';
import { AppDataSource } from './db';
import emsCategoriesRoutes from './routes/emsCategoriesRoutes';
import eventRoutes from './routes/eventRoutes';
import cookieParser from "cookie-parser";
import { ensureVisitorId } from './utils/cookie';
import { attachUserIfPresent } from './middleware/maybyAuth';


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
  origin:'http://localhost:5174',
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

app.use(cookieParser());
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/ems', emsCategoriesRoutes);
app.use('/event', eventRoutes);
app.use('/public', ensureVisitorId, publicRoutes);
app.use('/public', ensureVisitorId,attachUserIfPresent, rsvpRoutes);

// Pokretanje servera
app.listen(PORT, () => {
  console.log(`Server je pokrenut na http://localhost:${PORT}`);
});
