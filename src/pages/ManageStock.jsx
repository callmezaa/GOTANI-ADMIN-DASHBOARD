import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { Container, Typography, Grid, Card, CardContent, CardMedia, Box, Button, TextField, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from "@mui/material";

import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, addDoc, doc, serverTimestamp } from "firebase/firestore";

export default function ManageStock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stokValue, setStokValue] = useState(0);
  const [note, setNote] = useState("");

  const auth = getAuth();
  const user = auth.currentUser;

  const fetchProducts = async () => {
    try {
      if (!user) return;

      const ref = collection(db, "users", user.uid, "products");
      const snap = await getDocs(ref);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setProducts(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data stok");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const filteredProducts = products.filter((p) => p.nama?.toLowerCase().includes(search.toLowerCase()));

  /* ---------- QUICK UPDATE ---------- */
  const updateQuickStock = async (product, amount) => {
    const newStock = Number(product.stok) + amount;
    if (newStock < 0) return;

    try {
      const productRef = doc(db, "users", user.uid, "products", product.id);

      await updateDoc(productRef, { stok: newStock });

      const historyRef = collection(db, "users", user.uid, "products", product.id, "stok_history");

      await addDoc(historyRef, {
        amount,
        timestamp: serverTimestamp(),
        note: amount > 0 ? "Tambah stok cepat" : "Kurangi stok cepat",
      });

      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Gagal update stok");
    }
  };

  /* ---------- MANUAL ---------- */
  const handleOpenDialog = (product) => {
    setSelectedProduct(product);
    setStokValue(product.stok);
    setNote("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const updateManualStock = async () => {
    if (!selectedProduct) return;

    try {
      const diff = Number(stokValue) - Number(selectedProduct.stok);

      const productRef = doc(db, "users", user.uid, "products", selectedProduct.id);

      await updateDoc(productRef, {
        stok: Number(stokValue),
      });

      const historyRef = collection(db, "users", user.uid, "products", selectedProduct.id, "stok_history");

      await addDoc(historyRef, {
        amount: diff,
        timestamp: serverTimestamp(),
        note: note || "Update stok manual",
      });

      fetchProducts();
      handleCloseDialog();
    } catch (err) {
      console.error(err);
      alert("Gagal update stok");
    }
  };

  return (
    <AdminLayout>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Container sx={{ mt: 3, mb: 6 }}>
          {/* HEADER */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" fontWeight="bold">
              Manage Stok
            </Typography>
            <Typography color="text.secondary">Kelola stok produk secara real-time</Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          {/* SEARCH */}
          <Box sx={{ mb: 4 }}>
            <TextField fullWidth placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </Box>

          {/* LIST */}
          <Grid container spacing={3}>
            {filteredProducts.map((p) => {
              const isLowStock = p.stok <= 5;

              return (
                <Grid item xs={12} sm={6} md={4} key={p.id}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                      transition: "0.3s",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    {p.imageUri && <CardMedia component="img" height="180" image={p.imageUri} alt={p.nama} sx={{ objectFit: "cover" }} />}

                    <CardContent>
                      <Typography variant="h6" fontWeight="bold">
                        {p.nama}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 1,
                          fontWeight: "bold",
                          color: isLowStock ? "#E53935" : "#2E7D32",
                        }}
                      >
                        Stok: {p.stok} {p.unit}
                      </Typography>

                      <Typography color="text.secondary" sx={{ mb: 1 }}>
                        Harga: Rp {p.harga_jual?.toLocaleString()}
                      </Typography>

                      <Chip
                        label={isLowStock ? "Stok Menipis" : "Stok Aman"}
                        size="small"
                        sx={{
                          mb: 2,
                          backgroundColor: isLowStock ? "#FFECEC" : "#E8F5E9",
                          color: isLowStock ? "#E53935" : "#2E7D32",
                          fontWeight: "bold",
                        }}
                      />

                      {/* ACTIONS */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Button variant="outlined" color="error" onClick={() => updateQuickStock(p, -1)}>
                          −
                        </Button>

                        <Button variant="outlined" onClick={() => handleOpenDialog(p)}>
                          Edit
                        </Button>

                        <Button variant="contained" color="error" onClick={() => updateQuickStock(p, +1)}>
                          +
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* DIALOG */}
          <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
            <DialogTitle fontWeight="bold">Update Stok Produk</DialogTitle>

            <DialogContent sx={{ mt: 1 }}>
              <TextField fullWidth label="Stok Baru" type="number" sx={{ mb: 2 }} value={stokValue} onChange={(e) => setStokValue(e.target.value)} />

              <TextField fullWidth label="Catatan" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: koreksi stok fisik" />
            </DialogContent>

            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button variant="contained" color="error" onClick={updateManualStock}>
                Update
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      )}
    </AdminLayout>
  );
}
