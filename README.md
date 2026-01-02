# 🏠 Marbnb – Nekilnojamojo Turto Nuomos Sistema

Šis projektas yra **Full-Stack** žiniatinklio aplikacija, skirta nekilnojamojo turto nuomai. Tai yra bakalauro baigiamasis darbas, kuriame realizuotas pilnas vartotojų autentifikavimo ciklas, būstų valdymas ir rezervacijų sistema.

---

## 💻 0. Pasiruošimas: Kaip paruošti naują kompiuterį?

Jei naudojate visiškai naują kompiuterį, jame greičiausiai nėra įdiegtų įrankių kodo vykdymui. Sekite šiuos žingsnius:

### 1. Įdiekite Node.js ir NPM
`npm` (Node Package Manager) yra įrankis, kuris atsisiunčia visas projektui reikalingas bibliotekas.
1. Eikite į oficialią svetainę [nodejs.org](https://nodejs.org/).
2. Atsisiųskite ir įdiekite **LTS (Long Term Support)** versiją.
3. Įdiegus, patikrinkite ar veikia terminale įvedę:
   * `node -v`
   * `npm -v`

### 2. Kodo redaktorius
Rekomenduojama naudoti **Visual Studio Code (VS Code)**. Atsisiųskite iš [code.visualstudio.com](https://code.visualstudio.com/).

---

## 🚀 Technologinis stekas (Tech Stack)

* **Frontend:** React.js (Vite), Tailwind CSS, Lucide-React (piktogramos).
* **Backend:** Node.js, Express.js.
* **Duomenų bazė:** SQLite (fizinis failas `database.db`).
* **Saugumas:** Bcrypt (slaptažodžių šifravimas naudojant *Salted Hashing*).

---

## 🛠️ Instaliacija ir paruošimas

Atlikite šiuos žingsnius projekto paleidimui:

### 1. Priklausomybių įdiegimas
Atidarykite terminalą pagrindiniame projekto aplanke (`airbnb-clone`):

```bash
# Įdiegti pagrindinius projekto valdymo įrankius
npm install

# Įdiegti serverio (Backend) bibliotekas
cd server
npm install

# Įdiegti kliento (Frontend) bibliotekas
cd ../client
npm install
```

### 2. Duomenų bazės inicializavimas
Serveris automatiškai sukurs `database.db` failą pirmo paleidimo metu. Jame bus sugeneruotos reikiamos lentelės ir pradiniai testavimo duomenys.

> **SVARBU:** Jei norite išvalyti visus duomenis, tiesiog ištrinkite `server/database.db` failą ir paleiskite serverį iš naujo.

### 3. Sistemos paleidimas
Grįžkite į pagrindinį projekto aplanką ir paleiskite abi dalis (Frontend ir Backend) vienu metu:

```bash
npm start
```

* **Vartotojo sąsaja:** `http://localhost:5173`

---

## 🔑 Testavimo duomenys
Sistemoje automatiškai sugeneruojami šie vartotojai (slaptažodis visiems: **123**):

| Rolė | El. paštas | Paskirtis |
| :--- | :--- | :--- |
| **Keliautojas** | `guest@vu.lt` | Gali ieškoti būstų, juos rezervuoti ir valdyti savo keliones. |
| **Šeimininkas** | `host@vu.lt` | Gali kelti būstus, priskirti kategorijas ir matyti pajamas. |
| **Adminas** | `admin@vu.lt` | Turi prieigą prie visų sistemos duomenų peržiūros. |

---

## 📋 Realizuotos funkcijos

### 🔍 Dinaminis filtravimas
Vartotojai gali filtruoti būstus pagal kategorijas: **Miestas**, **Gamta**, **Pajūris**. Tai realizuota per React būsenos (*state*) valdymą, užtikrinant žaibišką veikimą be puslapio perkrovimo.



### 🏠 Skelbimų valdymas (Host)
Šeimininkai turi dedikuotą sąsają pridėti naujus būstus:
* **Informacija:** Pavadinimas, vieta ir kaina už naktį.
* **Kategorijos parinkimas:** Būtina savybė, kad būstas būtų matomas filtravimo sistemoje.
* **Nuotraukos:** Pridėjimas naudojant tiesioginę URL nuorodą.

### 📅 Rezervacijų sistema
* **Vartotojo skydas:** Galimybė peržiūrėti savo rezervacijas ir jas atšaukti (`DELETE` užklausa į DB).
* **Šeimininko skydas:** Matoma gautų užsakymų statistika (kiekis ir bendras potencialus uždarbis).
* **Saugumas:** Rezervacijos automatiškai susiejamos su prisijungusio vartotojo el. paštu per sesiją.



---

## 📂 Projekto struktūra

```text
airbnb-clone/
├── client/              # React aplikacija (Frontend)
│   ├── src/
│   │   ├── components/  # Navbar, ListingCard, t.t.
│   │   ├── pages/       # Home, Login, HostDashboard, UserDashboard
│   │   └── services/    # Auth.js (API komunikacija)
├── server/              # Node.js serveris (Backend)
│   ├── server.js        # API endpoint'ai ir DB logika
│   └── database.db      # Fizinė SQLite duomenų bazė (atsiranda po paleidimo)
└── package.json         # Konfigūracija ir "npm start" skriptas
```

##🛡️ Saugumas ir Duomenų vientisumas
* **Slaptažodžiai:** Naudojama bcrypt biblioteka „hašavimui“. Duomenų bazėje saugomi tik negrįžtami kontroliniai kodai.
* **SQL Ryšiai:** Užklausos vykdomos naudojant JOIN operacijas, dinamiškai apjungiant rezervacijų ir būstų informaciją.
* **Vartotojo sesija:** Autentifikuota vartotojo informacija saugoma sessionStorage naršyklėje, užtikrinant privatumą.
