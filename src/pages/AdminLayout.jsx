import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, Box, CssBaseline, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, AppBar, Toolbar as MuiToolbar, Tooltip, useMediaQuery, Fade, Switch as MuiSwitch } from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import StoreIcon from "@mui/icons-material/Store";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { getAuth, signOut } from "firebase/auth";

const drawerWidth = 260;

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const auth = getAuth();

  // theme mode (default follow system)
  const [mode, setMode] = useState(prefersDark ? "dark" : "light");
  useEffect(() => {
    setMode(prefersDark ? "dark" : "light");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersDark]);

  // mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen((s) => !s);

  // animated highlight index (based on pathname)
  const menuItems = useMemo(
    () => [
      { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
      { text: "Manage Produk", icon: <Inventory2Icon />, path: "/manage-products" },
      { text: "Manage Stok", icon: <StoreIcon />, path: "/manage-stock" },
      { text: "Manage Karyawan", icon: <PeopleIcon />, path: "/manage-employees" },
      { text: "Riwayat Transaksi", icon: <ReceiptIcon />, path: "/transactions" },
      { text: "Laporan", icon: <BarChartIcon />, path: "/reports" },
      { text: "Pengaturan", icon: <SettingsIcon />, path: "/settings" },
    ],
    []
  );

  // find active index
  const activeIndex = menuItems.findIndex((m) => m.path === location.pathname);

  // admin data (from Firebase Auth) — displayName & photoURL used for avatar
  const [admin, setAdmin] = useState({ displayName: "Admin GOTANI", email: "", photoURL: "" });
  useEffect(() => {
    const u = auth.currentUser;
    if (u) {
      setAdmin({
        displayName: u.displayName || u.email?.split("@")[0] || "Admin GOTANI",
        email: u.email || "",
        photoURL: u.photoURL || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.currentUser]);

  // theme
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#FF3D3D",
            contrastText: "#fff",
          },
          background: {
            default: mode === "dark" ? "#0b1020" : "#fafafa",
            paper: mode === "dark" ? "#0f1724" : "#ffffff",
          },
        },
        typography: {
          fontFamily: "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto",
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                transition: "box-shadow .25s ease, transform .25s ease",
              },
            },
          },
        },
      }),
    [mode]
  );

  // logout convenience (sign out + nav)
  const handleLogout = async () => {
    try {
      if (auth.currentUser) await signOut(auth);
    } catch (err) {
      console.warn("SignOut failed:", err);
    } finally {
      navigate("/login");
    }
  };

  // Drawer content (Glass style)
  const drawer = (
    <Box
      sx={{
        height: "100%",
        px: 2,
        py: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        color: mode === "dark" ? "#fff" : "#1f2937",
        // glass effect
        background: mode === "dark" ? "linear-gradient(180deg, rgba(255,61,61,0.08), rgba(0,0,0,0.12))" : "linear-gradient(180deg, rgba(255,61,61,0.06), rgba(255,255,255,0.5))",
        borderRight: mode === "dark" ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.04)",
        backdropFilter: "blur(8px) saturate(120%)",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", px: 1 }}>
        <Avatar
          src={admin.photoURL || undefined}
          alt={admin.displayName}
          sx={{
            width: 56,
            height: 56,
            border: "2px solid rgba(255,255,255,0.25)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
            backgroundColor: "#fff",
            color: "#FF3D3D",
            fontWeight: 700,
          }}
        >
          {(!admin.photoURL && admin.displayName?.[0]) || "G"}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {admin.displayName}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {admin.email}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Menu list */}
      <Box sx={{ position: "relative", flex: 1 }}>
        <List disablePadding>
          {menuItems.map((m, idx) => {
            const active = idx === activeIndex;
            return (
              <ListItemButton
                key={m.text}
                component={Link}
                to={m.path}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  py: 1.1,
                  px: 1.2,
                  transition: "all .28s cubic-bezier(.2,.8,.2,1)",
                  transform: active ? "translateX(6px)" : "none",
                  background: active ? `linear-gradient(90deg, rgba(255,61,61,0.12), rgba(255,61,61,0.06))` : "transparent",
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                    transform: "translateX(6px)",
                  },
                }}
              >
                <ListItemIcon sx={{ color: active ? "#FF3D3D" : "inherit", minWidth: 36 }}>{m.icon}</ListItemIcon>
                <ListItemText
                  primary={m.text}
                  primaryTypographyProps={{
                    fontWeight: active ? 700 : 500,
                    color: mode === "dark" ? "#fff" : "#0f1724",
                  }}
                />
                {/* animated thin highlight bar (right side) */}
                <Box
                  sx={{
                    position: "absolute",
                    right: 6,
                    width: 6,
                    height: active ? 36 : 0,
                    borderRadius: 2,
                    background: active ? "linear-gradient(180deg,#FF7A7A,#FF3D3D)" : "transparent",
                    transition: "height .28s ease",
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Divider />

      {/* Footer actions */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", justifyContent: "space-between", mt: 1 }}>
        <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={() => setMode((m) => (m === "dark" ? "light" : "dark"))}>{mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}</IconButton>
            <Typography variant="caption">{mode === "dark" ? "Light" : "Dark"}</Typography>
          </Box>
        </Tooltip>

        <ListItemButton
          onClick={handleLogout}
          sx={{
            ml: "auto",
            borderRadius: 2,
            py: 1,
            px: 1.2,
            background: "transparent",
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <ExitToAppIcon />
          </ListItemIcon>
          <ListItemText primary="Log Out" />
        </ListItemButton>
      </Box>
    </Box>
  );

  // page transition wrapper: use Fade keyed by pathname
  const PageContent = (
    <Fade in key={location.pathname} timeout={400}>
      <Box sx={{ transition: "opacity .4s ease, transform .4s ease" }}>{children}</Box>
    </Fade>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: theme.palette.background.default }}>
        {/* AppBar for small screens */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            display: { sm: "none" },
            background: mode === "dark" ? "rgba(6,6,10,0.46)" : "rgba(255,255,255,0.65)",
            backdropFilter: "blur(8px)",
          }}
        >
          <MuiToolbar>
            <IconButton edge="start" color="inherit" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
            <Typography sx={{ flexGrow: 1, fontWeight: 700 }}>GOTANI Admin</Typography>

            <Tooltip title="Toggle theme">
              <IconButton onClick={() => setMode((m) => (m === "dark" ? "light" : "dark"))}>{theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}</IconButton>
            </Tooltip>
          </MuiToolbar>
        </AppBar>

        {/* Desktop drawer */}
        <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
          <Drawer
            variant="permanent"
            open
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                border: "none",
                boxSizing: "border-box",
                // elevate to create floating effect
                ml: 2,
                mt: 6,
                height: "calc(100% - 96px)",
                borderRadius: 3,
                boxShadow: "0 10px 30px rgba(2,6,23,0.12)",
                overflow: "hidden",
                background: "transparent",
              },
            }}
          >
            {drawer}
          </Drawer>

          {/* Mobile drawer (temporary) */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                borderRadius: 2,
                margin: 2,
                background: "transparent",
                backdropFilter: "blur(18px)",
              },
            }}
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 4 },
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            transition: "all .28s ease",
          }}
        >
          {/* top spacing for mobile appbar */}
          <Box sx={{ display: { xs: "block", sm: "none" }, height: 68 }} />

          {/* Floating header card */}
          <Box
            sx={{
              mb: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {menuItems[activeIndex]?.text || "Dashboard"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                Welcome back, {admin.displayName}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Tooltip title="Toggle theme">
                <IconButton onClick={() => setMode((m) => (m === "dark" ? "light" : "dark"))}>{theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}</IconButton>
              </Tooltip>
              <IconButton onClick={() => handleLogout()}>
                <ExitToAppIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Page content with subtle container / floating surface */}
          <Box
            sx={{
              minHeight: "65vh",
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              background: mode === "dark" ? "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))" : "linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.4))",
              boxShadow: "0 8px 30px rgba(2,6,23,0.06)",
              transition: "all .28s ease",
            }}
          >
            {PageContent}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
