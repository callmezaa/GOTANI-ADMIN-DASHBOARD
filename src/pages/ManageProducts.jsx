import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { Container, Typography, Grid, Card, CardContent, CardMedia, Box, Button, TextField, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const [form, setForm] = useState({
    nama: "",
    harga_jual: "",
    harga_beli: "",
    kategori: "",
    unit: "",
    stok_awal: "",
    imageUri: "",
  });

  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;

  // ======================
  // Convert image to base64
  // ======================
  const convertToBase64 = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

  // ======================
  // Fetch products
  // ======================
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
      setError("Gagal mengambil data produk");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  // ======================
  // Dialog handler
  // ======================
  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditProduct(product);
      setForm({
        nama: product.nama || "",
        harga_jual: product.harga_jual || "",
        harga_beli: product.harga_beli || "",
        kategori: product.kategori || "",
        unit: product.unit || "",
        stok_awal: "",
        imageUri: product.imageUri || "",
      });
    } else {
      setEditProduct(null);
      setForm({
        nama: "",
        harga_jual: "",
        harga_beli: "",
        kategori: "",
        unit: "",
        stok_awal: "",
        imageUri: "",
      });
    }
    setSelectedImageFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  // ======================
  // Submit product
  // ======================
  const handleSubmit = async () => {
    try {
      if (!user) return;

      let imageBase64 = form.imageUri;
      if (selectedImageFile) {
        imageBase64 = await convertToBase64(selectedImageFile);
      }

      // ======================
      // PRODUCT PAYLOAD (SYNC WITH MOBILE)
      // ======================
      const productPayload = {
        nama: form.nama.trim(),
        kategori: form.kategori,
        unit: form.unit,
        harga_beli: Number(form.harga_beli),
        harga_jual: Number(form.harga_jual),
        imageUri: imageBase64 || "",
        createdAt: new Date(),
      };

      if (editProduct) {
        // UPDATE PRODUCT
        const ref = doc(db, "users", user.uid, "products", editProduct.id);
        await updateDoc(ref, productPayload);

        setProducts((prev) => prev.map((p) => (p.id === editProduct.id ? { ...productPayload, id: p.id } : p)));
      } else {
        // ADD PRODUCT
        const productRef = await addDoc(collection(db, "users", user.uid, "products"), productPayload);

        // ======================
        // CREATE INITIAL STOCK (stok_history)
        // ======================
        if (Number(form.stok_awal) > 0) {
          await addDoc(collection(db, "users", user.uid, "products", productRef.id, "stok_history"), {
            jumlah: Number(form.stok_awal),
            tipe: "initial",
            keterangan: "Stok awal dari admin web",
            createdAt: new Date(),
          });
        }

        setProducts([...products, { id: productRef.id, ...productPayload }]);
      }

      handleCloseDialog();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan produk");
    }
  };

  // ======================
  // Delete product
  // ======================
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus produk?")) return;
    await deleteDoc(doc(db, "users", user.uid, "products", id));
    setProducts(products.filter((p) => p.id !== id));
  };

  const filteredProducts = products.filter((p) => p.nama.toLowerCase().includes(search.toLowerCase()));

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
              Manage Products
            </Typography>
            <Typography color="text.secondary">Produk akan otomatis muncul di aplikasi mobile</Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          {/* SEARCH + ADD */}
          <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
            <TextField fullWidth placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button variant="contained" color="error" sx={{ px: 4, fontWeight: "bold" }} onClick={() => handleOpenDialog()}>
              + Add Product
            </Button>
          </Box>

          {/* PRODUCT LIST */}
          <Grid container spacing={3}>
            {filteredProducts.map((p) => (
              <Grid item xs={12} sm={6} md={4} key={p.id}>
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                    "&:hover": {
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  {p.imageUri && <CardMedia component="img" height="200" image={p.imageUri} alt={p.nama} />}

                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      {p.nama}
                    </Typography>

                    <Typography sx={{ color: "#E53935", fontWeight: "bold" }}>Rp {Number(p.harga_jual).toLocaleString()}</Typography>

                    <Typography variant="body2" color="text.secondary">
                      {p.kategori} • {p.unit}
                    </Typography>

                    <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                      <Button size="small" onClick={() => handleOpenDialog(p)}>
                        ✏️
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(p.id)}>
                        🗑️
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* DIALOG */}
          <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
            <DialogTitle fontWeight="bold">{editProduct ? "Edit Product" : "Add Product"}</DialogTitle>

            <DialogContent sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Nama Produk" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
                </Grid>

                <Grid item xs={6}>
                  <TextField fullWidth label="Harga Beli" type="number" value={form.harga_beli} onChange={(e) => setForm({ ...form, harga_beli: e.target.value })} />
                </Grid>

                <Grid item xs={6}>
                  <TextField fullWidth label="Harga Jual" type="number" value={form.harga_jual} onChange={(e) => setForm({ ...form, harga_jual: e.target.value })} />
                </Grid>

                <Grid item xs={6}>
                  <TextField fullWidth label="Kategori" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} />
                </Grid>

                <Grid item xs={6}>
                  <TextField fullWidth label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                </Grid>

                {!editProduct && (
                  <Grid item xs={12}>
                    <TextField fullWidth label="Stok Awal" type="number" value={form.stok_awal} onChange={(e) => setForm({ ...form, stok_awal: e.target.value })} helperText="Akan masuk ke histori stok" />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Button component="label" variant="outlined" fullWidth>
                    Upload Gambar
                    <input hidden type="file" accept="image/*" onChange={(e) => setSelectedImageFile(e.target.files[0])} />
                  </Button>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button variant="contained" color="error" onClick={handleSubmit}>
                {editProduct ? "Update" : "Add"}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      )}
    </AdminLayout>
  );
}
