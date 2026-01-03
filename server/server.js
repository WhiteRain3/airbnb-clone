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
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    email TEXT UNIQUE, 
    password TEXT, 
    role TEXT
  )`)

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

  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    listing_id INTEGER, 
    user_email TEXT, 
    date TEXT,
    status TEXT DEFAULT 'Patvirtinta'
  )`)

  const hash = (pw) => bcrypt.hashSync(pw, saltRounds)
  db.run("INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)", ["admin@vu.lt", hash("123"), "admin"])
  db.run("INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)", ["host@vu.lt", hash("123"), "host"])
  db.run("INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)", ["guest@vu.lt", hash("123"), "guest"])

  db.get("SELECT COUNT(*) as count FROM listings", (err, row) => {
    if (row && row.count === 0) {
      const initialListings = [
        ["Prabangus loftas senamiestyje", "Aukštos lubos ir modernus interjeras miesto širdyje.", 120, "Vilnius, Lietuva", "Miestas", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "host@vu.lt"],
        ["Namelis medyje", "Pabėkite nuo triukšmo į ramybės oazę gamtoje.", 85, "Anykščiai, Lietuva", "Gamta", "https://images.unsplash.com/photo-1449156001433-31f4964639e1?w=800", "host@vu.lt"],
        ["Moderni vila prie jūros", "Erdvi vila su vaizdu į kopas ir saulėlydžius.", 210, "Nida, Lietuva", "Pajūris", "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800", "host@vu.lt"],
        ["Stilingas butas Kaune", "Jaukus butas šalia Laisvės alėjos.", 65, "Kaunas, Lietuva", "Miestas", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "host@vu.lt"],
      ]
      const stmt = db.prepare("INSERT INTO listings (title, description, price, location, category, image, host_email) VALUES (?, ?, ?, ?, ?, ?, ?)")
      initialListings.forEach((l) => stmt.run(l))
      stmt.finalize()
    }
  })
})

/** API MARŠRUTAI **/

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
    } else res.status(401).json({ error: "Neteisingi duomenys" })
  })
})

app.get("/api/listings", (req, res) => {
  db.all("SELECT * FROM listings", [], (err, rows) => res.json(rows))
})

app.get("/api/listings/:id", (req, res) => {
  db.get("SELECT * FROM listings WHERE id = ?", [req.params.id], (err, row) => {
    if (!row) return res.status(404).json({ error: "Skelbimas nerastas" })
    res.json(row)
  })
})

app.post("/api/listings", (req, res) => {
  const { title, description, price, location, category, image, host_email } = req.body
  db.run("INSERT INTO listings (title, description, price, location, category, image, host_email) VALUES (?, ?, ?, ?, ?, ?, ?)", 
  [title, description, price, location, category, image, host_email], function (err) {
    if (err) return res.status(500).json({ error: err.message })
    res.status(201).json({ id: this.lastID, success: true })
  })
})

app.delete("/api/listings/:id", (req, res) => {
  const id = req.params.id
  db.serialize(() => {
    db.run("DELETE FROM bookings WHERE listing_id = ?", [id])
    db.run("DELETE FROM listings WHERE id = ?", [id], () => res.json({ success: true }))
  })
})

app.post("/api/bookings", (req, res) => {
  const { listing_id, user_email, date } = req.body
  db.run("INSERT INTO bookings (listing_id, user_email, date) VALUES (?, ?, ?)", [listing_id, user_email, date], () => res.status(201).json({ success: true }))
})

app.get("/api/bookings", (req, res) => {
  const { email, role } = req.query
  let sql = ""
  let params = []
  if (role === "admin") sql = `SELECT b.*, l.title, l.price, l.location FROM bookings b JOIN listings l ON b.listing_id = l.id`
  else if (role === "host") {
    sql = `SELECT b.*, l.title, l.price, l.location FROM bookings b JOIN listings l ON b.listing_id = l.id WHERE l.host_email = ?`
    params = [email]
  } else {
    sql = `SELECT b.*, l.title, l.price, l.location FROM bookings b JOIN listings l ON b.listing_id = l.id WHERE b.user_email = ?`
    params = [email]
  }
  db.all(sql, params, (err, rows) => res.json(rows))
})

app.delete("/api/bookings/:id", (req, res) => {
  db.run("DELETE FROM bookings WHERE id = ?", [req.params.id], () => res.json({ success: true }))
})

/** KONFIGŪRACIJA RENDER TALPINIMUI **/

// Jei NODE_ENV yra production, pateikiame sukompiliuotą React projektą
if (process.env.NODE_ENV === "production") {
  // Pateikiame statinius failus
  app.use(express.static(path.join(__dirname, "../client/dist")));

  // PATAISYTA: Naudojame :any* parametrą
  app.get('/*splat', (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "dist", "index.html"));
  });
}

// Paleidimas naudojant Render priskirtą PORT arba 5000 lokaliai
const PORT = process.env.PORT || 5000
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveris paleistas: prievadas ${PORT}`)
})