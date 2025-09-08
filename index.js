const express = require("express");
const path = require("path");
const app = express();
const port = 3127;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // sirve la UI

// Datos de prueba
let videojuegos = [
  { id: 1,  titulo: "Red Dead Redemption 2",     precio: 20 },
  { id: 2,  titulo: "Grand Theft Auto V",        precio: 15 },
  { id: 3,  titulo: "The Witcher 3: Wild Hunt",  precio: 18 },
  { id: 4,  titulo: "Elden Ring",                precio: 35 },
  { id: 5,  titulo: "Cyberpunk 2077",            precio: 25 },
  { id: 6,  titulo: "Minecraft",                 precio: 10 },
  { id: 7,  titulo: "God of War",                precio: 30 },
  { id: 8,  titulo: "Horizon Zero Dawn",         precio: 22 },
  { id: 9,  titulo: "Assassin's Creed Valhalla", precio: 28 },
  { id: 10, titulo: "FIFA 23",                   precio: 40 },
];

// --------- Rutas API ---------

// GET /videojuegos?q=...&minPrecio=...&maxPrecio=...&sort=precio|titulo&order=asc|desc&limit=...&offset=...
app.get("/videojuegos", (req, res) => {
  const {
    q,
    minPrecio,
    maxPrecio,
    sort,
    order = "asc",
    limit,
    offset = 0,
  } = req.query;

  let data = [...videojuegos];

  // Filtro por búsqueda textual en "titulo"
  if (q) {
    const needle = String(q).toLowerCase();
    data = data.filter(v => v.titulo.toLowerCase().includes(needle));
  }

  // Filtro por rango de precio
  const min = minPrecio !== undefined ? Number(minPrecio) : undefined;
  const max = maxPrecio !== undefined ? Number(maxPrecio) : undefined;

  if (!Number.isNaN(min) && min !== undefined) {
    data = data.filter(v => v.precio >= min);
  }
  if (!Number.isNaN(max) && max !== undefined) {
    data = data.filter(v => v.precio <= max);
  }

  // Ordenamiento
  if (sort === "precio" || sort === "titulo") {
    data.sort((a, b) => {
      const A = a[sort];
      const B = b[sort];
      if (typeof A === "string" && typeof B === "string") {
        return order === "desc" ? B.localeCompare(A) : A.localeCompare(B);
      }
      return order === "desc" ? B - A : A - B;
    });
  }

  // Paginación
  const off = Number(offset) || 0;
  let lim = limit !== undefined ? Number(limit) : undefined;
  if (Number.isNaN(lim)) lim = undefined;

  const total = data.length;
  const result = lim !== undefined ? data.slice(off, off + lim) : data;

  res.json({
    total,
    offset: off,
    limit: lim ?? total,
    items: result,
  });
});

// GET /videojuegos/:id
app.get("/videojuegos/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = videojuegos.find(v => v.id === id);
  if (!item) return res.status(404).json({ error: "No encontrado" });
  res.json(item);
});

// POST /videojuegos  { titulo, precio }
app.post("/videojuegos", (req, res) => {
  const { titulo, precio } = req.body;
  if (!titulo || typeof precio !== "number") {
    return res.status(400).json({ error: "titulo (string) y precio (number) son requeridos" });
  }
  const id = videojuegos.length ? Math.max(...videojuegos.map(v => v.id)) + 1 : 1;
  const nuevo = { id, titulo, precio };
  videojuegos.push(nuevo);
  res.status(201).json(nuevo);
});

// PUT /videojuegos/:id  { titulo?, precio? }
app.put("/videojuegos/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = videojuegos.findIndex(v => v.id === id);
  if (idx === -1) return res.status(404).json({ error: "No encontrado" });

  const { titulo, precio } = req.body;
  if (titulo !== undefined) videojuegos[idx].titulo = titulo;
  if (precio !== undefined) {
    if (typeof precio !== "number") {
      return res.status(400).json({ error: "precio debe ser number" });
    }
    videojuegos[idx].precio = precio;
  }
  res.json(videojuegos[idx]);
});

// DELETE /videojuegos/:id
app.delete("/videojuegos/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = videojuegos.findIndex(v => v.id === id);
  if (idx === -1) return res.status(404).json({ error: "No encontrado" });
  const [borrado] = videojuegos.splice(idx, 1);
  res.json(borrado);
});

// --------- Inicio del servidor ---------
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
