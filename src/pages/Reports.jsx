import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { Container, Typography, Grid, Paper, Box, CircularProgress, Button, Alert, Stack } from "@mui/material";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PaidIcon from "@mui/icons-material/Paid";

import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalProductsSold, setTotalProductsSold] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [error, setError] = useState("");

  const auth = getAuth();
  const adminUser = auth.currentUser;

  const fetchSalesReport = async () => {
    try {
      if (!adminUser) {
        setError("Admin belum login.");
        setLoading(false);
        return;
      }

      const transaksiRef = collection(db, "users", adminUser.uid, "transaksi");
      const snapshot = await getDocs(transaksiRef);

      const transaksi = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTotalTransactions(transaksi.length);

      const sumQty = transaksi.reduce((acc, t) => acc + (t.quantity || 0), 0);
      setTotalProductsSold(sumQty);

      const revenue = transaksi.reduce((acc, t) => acc + (t.total || 0), 0);
      setTotalRevenue(revenue);

      const productMap = {};
      transaksi.forEach((t) => {
        if (!productMap[t.productName]) {
          productMap[t.productName] = 0;
        }
        productMap[t.productName] += t.quantity;
      });

      const chartData = Object.keys(productMap).map((name) => ({
        name,
        sold: productMap[name],
      }));

      setSalesData(chartData);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil laporan penjualan.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSalesReport();
  }, [adminUser]);

  return (
    <AdminLayout>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Container sx={{ mt: 3, mb: 6 }}>
          {/* HEADER */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold">
              Laporan Penjualan
            </Typography>
            <Typography color="text.secondary">Ringkasan performa penjualan GOTANI</Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* STAT CARDS */}
          <Grid container spacing={3} sx={{ mb: 5 }}>
            {[
              {
                label: "Total Transaksi",
                value: totalTransactions,
                icon: <ReceiptLongIcon />,
              },
              {
                label: "Produk Terjual",
                value: totalProductsSold,
                icon: <Inventory2Icon />,
              },
              {
                label: "Total Pendapatan",
                value: `Rp ${totalRevenue.toLocaleString()}`,
                icon: <PaidIcon />,
              },
            ].map((item, idx) => (
              <Grid item xs={12} sm={4} key={idx}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    backdropFilter: "blur(12px)",
                    background: "linear-gradient(135deg, #ffffff 0%, #fff5f5 100%)",
                    boxShadow: "0 15px 35px rgba(0,0,0,0.08)",
                    transition: "0.3s",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 25px 45px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary">{item.label}</Typography>
                      <Typography variant="h4" fontWeight="bold" color="#E53935">
                        {item.value}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        bgcolor: "#FFEBEB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#E53935",
                        fontSize: 30,
                      }}
                    >
                      {item.icon}
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* CHART */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              boxShadow: "0 20px 45px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Penjualan per Produk
            </Typography>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sold" fill="#E53935" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* FILTER (FUTURE) */}
          <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
            <Button variant="outlined" color="error">
              Mingguan
            </Button>
            <Button variant="outlined" color="error">
              Bulanan
            </Button>
            <Button variant="outlined" color="error">
              Tahunan
            </Button>
          </Box>
        </Container>
      )}
    </AdminLayout>
  );
}
