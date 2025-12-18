import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { Box, Container, Typography, TextField, Button, Paper, Grid, Alert } from "@mui/material";

import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AddProduct() {
  const [form, setForm] = useState({
    nama: "",
    kategori: "",
    harga_jual: "",
    harga_beli: "",
    stok: "",
    totalStok: "",
    unit: "",
    expiredDate: "",
  });

  const [imageBase64, setImageBase64] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const auth = getAuth();
  const user = auth.currentUser;

  // -------------------------
  // Convert File to Base64
  // -------------------------
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setImageBase64(reader.result); // base64
    };

    reader.readAsDataURL(file); // Convert
  };

  // -------------------------
  // Submit Form
  // -------------------------
  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    try {
      if (!user) {
        setError("User belum login.");
        return;
      }

      const productsRef = collection(db, "users", user.uid, "products");

      await addDoc(productsRef, {
        ...form,
        harga_jual: Number(form.harga_jual),
        harga_beli: Number(form.harga_beli),
        stok: Number(form.stok),
        totalStok: Number(form.totalStok),
        imageUri: imageBase64,
        createdAt: serverTimestamp(),
      });

      setSuccess("Produk berhasil ditambahkan!");
      setForm({
        nama: "",
        kategori: "",
        harga_jual: "",
        harga_beli: "",
        stok: "",
        totalStok: "",
        unit: "",
        expiredDate: "",
      });
      setImageBase64("");
    } catch (err) {
      console.error(err);
      setError("Gagal menambahkan produk!");
    }
  };

  return (
    <AdminLayout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Add Product
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Nama */}
            <Grid item xs={12}>
              <TextField fullWidth label="Nama Produk" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
            </Grid>

            {/* Harga */}
            <Grid item xs={6}>
              <TextField fullWidth label="Harga Jual" type="number" value={form.harga_jual} onChange={(e) => setForm({ ...form, harga_jual: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Harga Beli" type="number" value={form.harga_beli} onChange={(e) => setForm({ ...form, harga_beli: e.target.value })} />
            </Grid>

            {/* Kategori & Unit */}
            <Grid item xs={6}>
              <TextField fullWidth label="Kategori" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </Grid>

            {/* Stok */}
            <Grid item xs={6}>
              <TextField fullWidth label="Stok" type="number" value={form.stok} onChange={(e) => setForm({ ...form, stok: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Total Stok" type="number" value={form.totalStok} onChange={(e) => setForm({ ...form, totalStok: e.target.value })} />
            </Grid>

            {/* Upload Gambar */}
            <Grid item xs={12}>
              <Typography sx={{ mb: 1 }}>Upload Gambar Produk</Typography>
              <input type="file" accept="image/*" onChange={handleImageUpload} />

              {imageBase64 && (
                <Box mt={2}>
                  <img src={imageBase64} alt="Preview" style={{ width: "200px", borderRadius: 8, objectFit: "cover" }} />
                </Box>
              )}
            </Grid>

            {/* Expired Date */}
            <Grid item xs={12}>
              <TextField fullWidth type="datetime-local" label="Expired Date" InputLabelProps={{ shrink: true }} value={form.expiredDate} onChange={(e) => setForm({ ...form, expiredDate: e.target.value })} />
            </Grid>

            {/* SUBMIT */}
            <Grid item xs={12}>
              <Button variant="contained" color="error" fullWidth sx={{ py: 1.4 }} onClick={handleSubmit}>
                Add Product
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </AdminLayout>
  );
}
