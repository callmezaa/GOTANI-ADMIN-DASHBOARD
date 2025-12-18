import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { Container, Typography, Grid, Card, CardContent, Avatar, Box, Button, TextField, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Alert, IconButton, Chip, Stack } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";

import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

export default function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Karyawan",
    photo: "",
    isActive: true,
  });

  const auth = getAuth();
  const adminUser = auth.currentUser;

  /* ---------- FETCH ---------- */
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      if (!adminUser) return;

      const ref = collection(db, "users", adminUser.uid, "employees");
      const snap = await getDocs(ref);
      setEmployees(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data karyawan");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, [adminUser]);

  /* ---------- FILE ---------- */
  const fileToBase64 = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

  const handleFileChange = async (e) => {
    if (!e.target.files?.[0]) return;
    const b64 = await fileToBase64(e.target.files[0]);
    setForm((f) => ({ ...f, photo: b64 }));
  };

  /* ---------- DIALOG ---------- */
  const handleOpenAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      email: "",
      role: "Karyawan",
      photo: "",
      isActive: true,
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (emp) => {
    setEditing(emp);
    setForm({ ...emp });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  /* ---------- SAVE ---------- */
  const handleSave = async () => {
    if (!form.name || !form.email) {
      setError("Nama & email wajib diisi");
      return;
    }

    try {
      const ref = collection(db, "users", adminUser.uid, "employees");

      if (editing) {
        await updateDoc(doc(ref, editing.id), {
          ...form,
          updatedAt: serverTimestamp(),
        });
        setEmployees((prev) => prev.map((e) => (e.id === editing.id ? { ...e, ...form } : e)));
      } else {
        const docRef = await addDoc(ref, {
          ...form,
          createdAt: serverTimestamp(),
        });
        setEmployees((prev) => [...prev, { id: docRef.id, ...form }]);
      }

      handleCloseDialog();
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan data karyawan");
    }
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async (emp) => {
    if (!window.confirm(`Hapus ${emp.name}?`)) return;
    await deleteDoc(doc(db, "users", adminUser.uid, "employees", emp.id));
    setEmployees((prev) => prev.filter((e) => e.id !== emp.id));
  };

  /* ---------- TOGGLE ---------- */
  const toggleActive = async (emp) => {
    await updateDoc(doc(db, "users", adminUser.uid, "employees", emp.id), { isActive: !emp.isActive });
    setEmployees((prev) => prev.map((e) => (e.id === emp.id ? { ...e, isActive: !e.isActive } : e)));
  };

  const filtered = employees.filter((e) => e.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <Container sx={{ mt: 3, mb: 6 }}>
        {/* HEADER */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Manage Karyawan
          </Typography>
          <Typography color="text.secondary">Kelola akun dan hak akses karyawan</Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {/* SEARCH */}
        <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
          <TextField fullWidth placeholder="Cari karyawan..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant="contained" color="error" onClick={handleOpenAdd}>
            Tambah
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filtered.map((emp) => (
              <Grid item xs={12} sm={6} md={4} key={emp.id}>
                <Card
                  sx={{
                    borderRadius: 4,
                    p: 2,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    transition: "0.3s",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 20px 45px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={emp.photo}
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: "#FF3D3D",
                      }}
                    >
                      {!emp.photo && <PersonIcon />}
                    </Avatar>

                    <Box flex={1}>
                      <Typography fontWeight="bold">{emp.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {emp.email}
                      </Typography>

                      <Stack direction="row" spacing={1} mt={1}>
                        <Chip label={emp.role} size="small" />
                        <Chip label={emp.isActive ? "Active" : "Inactive"} size="small" color={emp.isActive ? "success" : "default"} />
                      </Stack>
                    </Box>
                  </Stack>

                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => handleOpenEdit(emp)}>
                      Edit
                    </Button>

                    <Button size="small" variant={emp.isActive ? "contained" : "outlined"} color="success" onClick={() => toggleActive(emp)}>
                      {emp.isActive ? "Deactivate" : "Activate"}
                    </Button>

                    <IconButton color="error" onClick={() => handleDelete(emp)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* DIALOG */}
        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
          <DialogTitle fontWeight="bold">{editing ? "Edit Karyawan" : "Tambah Karyawan"}</DialogTitle>

          <DialogContent sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

            <TextField select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {["Admin", "Manager", "Kasir", "Gudang", "Karyawan"].map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>

            <Box>
              <Typography variant="body2">Foto (opsional)</Typography>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {form.photo && <Avatar src={form.photo} sx={{ width: 80, height: 80, mt: 1 }} />}
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleSave}>
              {editing ? "Update" : "Tambah"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
}
