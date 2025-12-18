import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { Container, Typography, Box, TextField, Button, Paper, CircularProgress, Alert, Divider, Stack } from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import SaveIcon from "@mui/icons-material/Save";

import { getAuth, updateEmail, updatePassword } from "firebase/auth";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function Settings() {
  const auth = getAuth();
  const adminUser = auth.currentUser;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch Data Admin
  const fetchSettings = async () => {
    try {
      if (!adminUser) {
        setError("Admin belum login.");
        setLoading(false);
        return;
      }

      const ref = doc(db, "users", adminUser.uid);
      const snapshot = await getDoc(ref);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setName(data.name || "");
        setEmail(data.email || adminUser.email || "");
      }
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data pengaturan.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (!adminUser) {
        setError("Tidak ada admin yang login.");
        setSaving(false);
        return;
      }

      if (email !== adminUser.email) {
        await updateEmail(adminUser, email);
      }

      if (newPassword.trim().length > 0) {
        if (newPassword.length < 6) {
          setError("Password harus minimal 6 karakter.");
          setSaving(false);
          return;
        }
        await updatePassword(adminUser, newPassword);
      }

      const ref = doc(db, "users", adminUser.uid);
      await updateDoc(ref, {
        name,
        email,
      });

      setSuccess("Perubahan berhasil disimpan!");
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan perubahan. Silakan login ulang.");
    }

    setSaving(false);
  };

  return (
    <AdminLayout>
      <Container sx={{ mt: 3, mb: 6 }}>
        {/* HEADER */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">
            Pengaturan Akun
          </Typography>
          <Typography color="text.secondary">Kelola informasi akun admin GOTANI</Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper
            sx={{
              p: 4,
              maxWidth: 640,
              borderRadius: 4,
              backdropFilter: "blur(14px)",
              background: "linear-gradient(135deg, #ffffff 0%, #fff5f5 100%)",
              boxShadow: "0 25px 55px rgba(0,0,0,0.12)",
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            {/* PROFILE SECTION */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Informasi Profil
            </Typography>

            <Stack spacing={3} sx={{ mb: 4 }}>
              <TextField
                label="Nama"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1 }} />,
                }}
              />

              <TextField
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1 }} />,
                }}
              />
            </Stack>

            <Divider sx={{ my: 4 }} />

            {/* SECURITY SECTION */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Keamanan Akun
            </Typography>

            <Stack spacing={3}>
              <TextField
                label="Password Baru"
                type="password"
                fullWidth
                placeholder="Kosongkan jika tidak ingin mengubah password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  startAdornment: <LockIcon sx={{ mr: 1 }} />,
                }}
              />

              <Button
                variant="contained"
                color="error"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  mt: 2,
                  py: 1.3,
                  fontWeight: "bold",
                  borderRadius: 3,
                  boxShadow: "0 10px 25px rgba(229,57,53,0.4)",
                  "&:hover": {
                    boxShadow: "0 14px 30px rgba(229,57,53,0.6)",
                  },
                }}
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </Stack>
          </Paper>
        )}
      </Container>
    </AdminLayout>
  );
}
