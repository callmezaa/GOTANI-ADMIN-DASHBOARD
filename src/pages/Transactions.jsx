import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, TextField, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, Select, MenuItem, Chip, Stack } from "@mui/material";

import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function Transactions() {
  const auth = getAuth();
  const adminUser = auth.currentUser;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [error, setError] = useState("");

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  // =========================
  // FETCH REALTIME TRANSAKSI
  // =========================
  useEffect(() => {
    if (!adminUser) {
      setError("Admin belum login.");
      setLoading(false);
      return;
    }

    const q = query(collection(db, "users", adminUser.uid, "transaksi"), orderBy("date", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Gagal memuat transaksi.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [adminUser]);

  // =========================
  // FILTER + SEARCH
  // =========================
  const filteredTransactions = transactions.filter((t) => {
    const keyword = (t.productName || "").toLowerCase().includes(search.toLowerCase()) || (t.employeeName || "").toLowerCase().includes(search.toLowerCase());

    const txDate = t.date?.seconds ? new Date(t.date.seconds * 1000) : null;
    const now = new Date();

    let passFilter = true;

    if (filter === "today" && txDate) {
      passFilter = txDate.toDateString() === now.toDateString();
    }

    if (filter === "month" && txDate) {
      passFilter = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }

    return keyword && passFilter;
  });

  // =========================
  // INSIGHT OTOMATIS
  // =========================
  const bestProduct = Object.entries(
    transactions.reduce((acc, t) => {
      if (!t.productName) return acc;
      acc[t.productName] = (acc[t.productName] || 0) + (t.quantity || 0);
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1])[0];

  const bestEmployee = Object.entries(
    transactions.reduce((acc, t) => {
      if (!t.employeeName) return acc;
      acc[t.employeeName] = (acc[t.employeeName] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1])[0];

  return (
    <AdminLayout>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Container sx={{ mt: 2, mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Riwayat Transaksi
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* INSIGHT */}
          {(bestProduct || bestEmployee) && (
            <Alert severity="info" sx={{ mb: 3 }}>
              🔥 Produk terlaris: <b>{bestProduct?.[0] || "-"}</b> ({bestProduct?.[1] || 0} item)
              <br />
              👤 Karyawan teraktif: <b>{bestEmployee?.[0] || "-"}</b>
            </Alert>
          )}

          {/* SEARCH & FILTER */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
            <TextField fullWidth label="Cari (Produk / Karyawan)" value={search} onChange={(e) => setSearch(e.target.value)} />

            <Select value={filter} onChange={(e) => setFilter(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="all">Semua</MenuItem>
              <MenuItem value="today">Hari Ini</MenuItem>
              <MenuItem value="month">Bulan Ini</MenuItem>
            </Select>
          </Stack>

          {/* TABLE */}
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#FFEBEB" }}>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Produk</TableCell>
                  <TableCell>Karyawan</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Tanggal</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => (
                    <TableRow
                      key={t.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedTx(t);
                        setOpenDetail(true);
                      }}
                    >
                      <TableCell>{t.id}</TableCell>
                      <TableCell>{t.productName || "-"}</TableCell>
                      <TableCell>
                        <Chip label={t.employeeName || "-"} color="error" size="small" />
                      </TableCell>
                      <TableCell>{t.quantity}</TableCell>
                      <TableCell>Rp {Number(t.total || 0).toLocaleString()}</TableCell>
                      <TableCell>{t.date?.seconds ? new Date(t.date.seconds * 1000).toLocaleString() : "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      Tidak ada transaksi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      )}

      {/* MODAL DETAIL */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} fullWidth>
        <DialogTitle>Detail Transaksi</DialogTitle>
        <DialogContent dividers>
          {selectedTx && (
            <Stack spacing={1.5}>
              <Typography>
                <b>Produk:</b> {selectedTx.productName}
              </Typography>
              <Typography>
                <b>Karyawan:</b> {selectedTx.employeeName}
              </Typography>
              <Typography>
                <b>Jumlah:</b> {selectedTx.quantity}
              </Typography>
              <Typography>
                <b>Total:</b> Rp {Number(selectedTx.total || 0).toLocaleString()}
              </Typography>
              <Typography>
                <b>Tanggal:</b> {selectedTx.date?.seconds ? new Date(selectedTx.date.seconds * 1000).toLocaleString() : "-"}
              </Typography>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
