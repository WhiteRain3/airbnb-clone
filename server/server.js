const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const cors = require("cors")
const path = require("path")
const bcrypt = require("bcrypt")

const app = express()
const saltRounds = 10

// Middleware
app.use(cors())
app.use(express.json())

// Duomenų bazės nustatymai
const dbPath = path.resolve(__dirname, "database.db")
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("DB klaida:", err.message)
  else console.log("Prisijungta prie fizinės SQLite DB.")
})

// Lentelių kūrimas ir pradiniai duomenys
db.serialize(() => {
  // 1. Vartotojų lentelė
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    email TEXT UNIQUE, 
    password TEXT, 
    role TEXT
  )`)

  // 2. Skelbimų lentelė (Atnaujinta su DESCRIPTION)
  db.run(`CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    title TEXT, 
    description TEXT, 
    price REAL, 
    location TEXT, 
    category TEXT, 
    image TEXT,
    host_email TEXT
  )`)

  // 3. Rezervacijų lentelė
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    listing_id INTEGER, 
    user_email TEXT, 
    date TEXT,
    status TEXT DEFAULT 'Patvirtinta'
  )`)

  // Pradiniai vartotojai
  const hash = (pw) => bcrypt.hashSync(pw, saltRounds)
  db.run("INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)", ["admin@vu.lt", hash("123"), "admin"])
  db.run("INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)", ["host@vu.lt", hash("123"), "host"])
  db.run("INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)", ["guest@vu.lt", hash("123"), "guest"])

  // Pradiniai skelbimai su aprašymais
  db.get("SELECT COUNT(*) as count FROM listings", (err, row) => {
    if (row && row.count === 0) {
      const initialListings = [
        [
          "Prabangus loftas senamiestyje",
          "Aukštos lubos, autentiškos plytos ir modernus interjeras pačioje miesto širdyje. Puikiai tinka poroms ar verslo kelionėms.",
          120,
          "Vilnius, Lietuva",
          "Miestas",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
          "host@vu.lt",
        ],
        [
          "Namelis medyje",
          "Pabėkite nuo miesto triukšmo į ramybės oazę. Šis namelis medyje suteiks nepamirštamą patirtį gamtos apsuptyje.",
          85,
          "Anykščiai, Lietuva",
          "Gamta",
          "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fs.hdnux.com%2Fphotos%2F01%2F01%2F17%2F10%2F17101347%2F3%2FrawImage.jpg&f=1&nofb=1&ipt=726eb6ab1b025ca8b4e6b7dccde943a3269f29022f11995aff16bdd000548149",
          "host@vu.lt",
        ],
        [
          "Moderni vila prie jūros",
          "Erdvi vila su vaizdu į kopas. Didelė terasa vakarams stebint saulėlydį ir tiesioginis praėjimas į paplūdimį.",
          210,
          "Nida, Lietuva",
          "Pajūris",
          "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
          "host@vu.lt",
        ],
        [
          "Stilingas butas Kaune",
          "Jaukus, minimalistinis butas šalia Laisvės alėjos. Visi lankytini objektai pasiekiami pėsčiomis.",
          65,
          "Kaunas, Lietuva",
          "Miestas",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
          "host@vu.lt",
        ],
      ]
      const stmt = db.prepare(
        "INSERT INTO listings (title, description, price, location, category, image, host_email) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      initialListings.forEach((l) => stmt.run(l))
      stmt.finalize()
      console.log("Pradiniai skelbimai sukurti.")
    }
  })
})

/** API MARŠRUTAI **/

// Vartotojų valdymas
app.post("/api/register", (req, res) => {
  const { email, password, role } = req.body
  const hashed = bcrypt.hashSync(password, saltRounds)
  db.run("INSERT INTO users (email, password, role) VALUES (?, ?, ?)", [email, hashed, role], (err) => {
    if (err) return res.status(500).json({ error: "Vartotojas jau egzistuoja" })
    res.status(201).json({ success: true })
  })
})

app.post("/api/login", (req, res) => {
  const { email, password } = req.body
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (user && bcrypt.compareSync(password, user.password)) {
      const { password, ...safeUser } = user
      res.json({ user: safeUser })
    } else {
      res.status(401).json({ error: "Neteisingi duomenys" })
    }
  })
})

// Skelbimų valdymas
app.get("/api/listings", (req, res) => {
  db.all("SELECT * FROM listings", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

app.get("/api/listings/:id", (req, res) => {
  db.get("SELECT * FROM listings WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message })
    if (!row) return res.status(404).json({ error: "Skelbimas nerastas" })
    res.json(row)
  })
})

// Sukurti naują skelbimą (Pridėtas description ir host_email)
app.post("/api/listings", (req, res) => {
  const { title, description, price, location, category, image, host_email } = req.body
  const query = `INSERT INTO listings (title, description, price, location, category, image, host_email) VALUES (?, ?, ?, ?, ?, ?, ?)`
  db.run(query, [title, description, price, location, category, image, host_email], function (err) {
    if (err) return res.status(500).json({ error: err.message })
    res.status(201).json({ id: this.lastID, success: true })
  })
})

// Šalinti skelbimą (Admin/Host funkcija)
app.delete("/api/listings/:id", (req, res) => {
  const id = req.params.id
  // Pirmiausia ištriname susijusias rezervacijas, tada patį skelbimą (duomenų vientisumui)
  db.serialize(() => {
    db.run("DELETE FROM bookings WHERE listing_id = ?", [id])
    db.run("DELETE FROM listings WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ success: true })
    })
  })
})

// Rezervacijų valdymas
app.post("/api/bookings", (req, res) => {
  const { listing_id, user_email, date } = req.body
  if (!listing_id || !user_email) return res.status(400).json({ error: "Trūksta duomenų" })

  const query = `INSERT INTO bookings (listing_id, user_email, date) VALUES (?, ?, ?)`
  db.run(query, [listing_id, user_email, date], function (err) {
    if (err) return res.status(500).json({ error: err.message })
    res.status(201).json({ id: this.lastID, success: true })
  })
})

app.get("/api/bookings", (req, res) => {
  const { email, role } = req.query
  let sql = ""
  let params = []

  // Adminas mato viską, Hostas savo būstų užsakymus, Guest tik savo užsakymus
  if (role === "admin") {
    sql = `SELECT b.*, l.title, l.price, l.location FROM bookings b JOIN listings l ON b.listing_id = l.id`
  } else if (role === "host") {
    sql = `SELECT b.*, l.title, l.price, l.location FROM bookings b JOIN listings l ON b.listing_id = l.id WHERE l.host_email = ?`
    params = [email]
  } else {
    sql = `SELECT b.*, l.title, l.price, l.location FROM bookings b JOIN listings l ON b.listing_id = l.id WHERE b.user_email = ?`
    params = [email]
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

app.delete("/api/bookings/:id", (req, res) => {
  db.run("DELETE FROM bookings WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ success: true })
  })
})

// Paleidimas
const PORT = 5000
app.listen(PORT, () => console.log(`Backend veikia: http://localhost:${PORT}`))
