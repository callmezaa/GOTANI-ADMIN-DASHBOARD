import { useState } from "react";
import { Box, Paper, TextField, Typography, Button, Alert, IconButton, Fade } from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Email atau password salah!");
    }
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
          elevation={0}
          sx={{
            p: 5,
            width: { xs: "95%", sm: 430 },
            borderRadius: 4,
            backdropFilter: "blur(18px)",
            background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))",
            boxShadow: "0 30px 60px rgba(0,0,0,0.25)",
            transform: "translateY(0)",
          }}
        >
          {/* BRAND */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ letterSpacing: 1 }}>
              GOTANI
            </Typography>
            <Typography color="text.secondary">Admin Dashboard</Typography>
          </Box>

          {/* TITLE */}
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            Sign In
          </Typography>
          <Typography textAlign="center" color="text.secondary" sx={{ mb: 3 }}>
            Masuk untuk mengelola sistem
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* FORM */}
          <Box component="form" onSubmit={handleLogin}>
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

            <Button
              type="submit"
              fullWidth
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
              Sign In
            </Button>
          </Box>

          {/* REGISTER LINK */}
          <Typography sx={{ textAlign: "center", mt: 3 }}>
            Belum punya akun?{" "}
            <span
              style={{
                color: "#e53935",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onClick={() => navigate("/register")}
            >
              Sign Up
            </span>
          </Typography>
        </Paper>
      </Fade>
    </Box>
  );
}
