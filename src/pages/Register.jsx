import { useState } from "react";
import { Box, Paper, TextField, Typography, Button, Alert, IconButton, Fade } from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock, Person } from "@mui/icons-material";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      return setError("Password minimal 6 karakter.");
    }

    if (password !== confirmPassword) {
      return setError("Konfirmasi password tidak cocok.");
    }

    try {
      setLoading(true);

      // Firebase Auth
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // Firestore user profile
      await setDoc(doc(db, "users", res.user.uid), {
        name,
        email,
        role: "Admin",
        createdAt: serverTimestamp(),
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Gagal membuat akun. Email mungkin sudah terdaftar.");
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)",
        p: 2,
      }}
    >
      <Fade in timeout={900}>
        <Paper
          sx={{
            p: 5,
            width: { xs: "95%", sm: 450 },
            borderRadius: 4,
            backdropFilter: "blur(18px)",
            background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))",
            boxShadow: "0 30px 60px rgba(0,0,0,0.25)",
          }}
        >
          {/* BRAND */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" fontWeight="bold">
              GOTANI
            </Typography>
            <Typography color="text.secondary">Admin Registration</Typography>
          </Box>

          {/* TITLE */}
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            Create Account
          </Typography>
          <Typography textAlign="center" color="text.secondary" sx={{ mb: 3 }}>
            Daftarkan akun admin baru
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* FORM */}
          <Box component="form" onSubmit={handleRegister}>
            <TextField
              label="Nama Lengkap"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              InputProps={{
                startAdornment: <Person sx={{ mr: 1 }} />,
              }}
            />

            <TextField
              label="Email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: <Email sx={{ mr: 1 }} />,
              }}
            />

            <TextField
              label="Password"
              fullWidth
              margin="normal"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: <Lock sx={{ mr: 1 }} />,
                endAdornment: <IconButton onClick={() => setShowPassword((x) => !x)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>,
              }}
            />

            <TextField label="Konfirmasi Password" fullWidth margin="normal" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              variant="contained"
              sx={{
                mt: 3,
                py: 1.4,
                fontWeight: "bold",
                borderRadius: 3,
                background: "linear-gradient(135deg, #e53935, #b71c1c)",
                boxShadow: "0 10px 30px rgba(229,57,53,0.45)",
                "&:hover": {
                  boxShadow: "0 14px 35px rgba(229,57,53,0.6)",
                },
              }}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </Box>

          {/* LOGIN LINK */}
          <Typography sx={{ textAlign: "center", mt: 3 }}>
            Sudah punya akun?{" "}
            <span
              style={{
                color: "#e53935",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onClick={() => navigate("/login")}
            >
              Sign In
            </span>
          </Typography>
        </Paper>
      </Fade>
    </Box>
  );
}
