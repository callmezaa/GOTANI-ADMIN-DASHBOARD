import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import { Container, Typography, Grid, Paper, Box, CircularProgress, Button, ToggleButton, ToggleButtonGroup, Divider } from "@mui/material";

import Inventory2Icon from "@mui/icons-material/Inventory2";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InsightsIcon from "@mui/icons-material/Insights";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import dayjs from "dayjs";

/* ===============================
   STAT CARD COMPONENT
================================ */
const StatCard = ({ title, value, icon, gradient }) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: 4,
      background: gradient,
      color: "#fff",
      boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {value}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

export default function Dashboard() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("daily"); // daily | monthly

  /* ===============================
     REAL-TIME FIRESTORE
  ================================ */
  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "users", user.uid, "transaksi");

    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setTransactions(data);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  /* ===============================
     AGGREGATION DATA
  ================================ */
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalQty = 0;

    transactions.forEach((t) => {
      totalRevenue += t.total || 0;
      totalQty += t.quantity || 0;
    });

    return {
      totalTransactions: transactions.length,
      totalRevenue,
      totalQty,
    };
  }, [transactions]);

  /* ===============================
     CHART DATA (DAILY / MONTHLY)
  ================================ */
  const chartData = useMemo(() => {
    const map = {};

    transactions.forEach((t) => {
      const date = dayjs(t.createdAt?.toDate());
      const key = filter === "daily" ? date.format("DD MMM") : date.format("MMM YYYY");

      if (!map[key]) map[key] = { label: key, revenue: 0, sales: 0 };

      map[key].revenue += t.total || 0;
      map[key].sales += t.quantity || 0;
    });

    return Object.values(map);
  }, [transactions, filter]);

  /* ===============================
     AUTO INSIGHT (RULE BASED)
  ================================ */
  const insight = useMemo(() => {
    if (transactions.length === 0) return "Belum ada transaksi.";

    const productMap = {};
    const dayMap = {};

    transactions.forEach((t) => {
      productMap[t.productName] = (productMap[t.productName] || 0) + t.quantity;
      const day = dayjs(t.createdAt?.toDate()).format("dddd");
      dayMap[day] = (dayMap[day] || 0) + t.total;
    });

    const bestProduct = Object.entries(productMap).sort((a, b) => b[1] - a[1])[0];
    const bestDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0];

    return `📈 Produk terlaris adalah "${bestProduct[0]}" (${bestProduct[1]} terjual). 
💰 Penjualan tertinggi terjadi pada hari ${bestDay[0]}.`;
  }, [transactions]);

  return (
    <AdminLayout>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Container sx={{ mt: 2, mb: 6 }}>
          {/* HEADER */}
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Dashboard
          </Typography>

          {/* STAT CARDS */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <StatCard title="Total Transaksi" value={stats.totalTransactions} icon={<ShoppingCartIcon />} gradient="linear-gradient(135deg,#FF6B6B,#FF3D3D)" />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard title="Produk Terjual" value={stats.totalQty} icon={<ReceiptLongIcon />} gradient="linear-gradient(135deg,#F7971E,#FFD200)" />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard title="Pendapatan" value={`Rp ${stats.totalRevenue.toLocaleString()}`} icon={<AttachMoneyIcon />} gradient="linear-gradient(135deg,#56CCF2,#2F80ED)" />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard title="Total Produk" value="Realtime" icon={<Inventory2Icon />} gradient="linear-gradient(135deg,#43CEA2,#185A9D)" />
            </Grid>
          </Grid>

          {/* FILTER */}
          <Box sx={{ mb: 2 }}>
            <ToggleButtonGroup value={filter} exclusive onChange={(e, v) => v && setFilter(v)}>
              <ToggleButton value="daily">Harian</ToggleButton>
              <ToggleButton value="monthly">Bulanan</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* CHART */}
          <Paper sx={{ p: 3, borderRadius: 4, mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Grafik Penjualan
            </Typography>

            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#FF3D3D" strokeWidth={3} />
                <Line type="monotone" dataKey="revenue" stroke="#2F80ED" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>

          {/* INSIGHT */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              background: "linear-gradient(135deg,#111827,#1f2937)",
              color: "#fff",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <InsightsIcon />
              <Typography variant="h6" fontWeight="bold">
                Insight Otomatis
              </Typography>
            </Box>
            <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.2)" }} />
            <Typography>{insight}</Typography>
          </Paper>
        </Container>
      )}
    </AdminLayout>
  );
}
