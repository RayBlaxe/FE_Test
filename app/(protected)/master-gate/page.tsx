"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import { AppShell } from "@/components/layout/AppShell";

import { apiFetch } from "@/lib/http";
import type { Gerbang } from "@/types/gerbang";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function MasterGatePage() {
  const [data, setData] = useState<Gerbang[]>([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Gerbang | null>(null);
  const [form, setForm] = useState<Gerbang>({
    id: 0,
    IdCabang: 0,
    NamaGerbang: "",
    NamaCabang: "",
  });
  const [error, setError] = useState("");

 async function fetchGerbangs() {
  try {
    setLoading(true);
    const res = await apiFetch("/gerbangs");

    // sesuai response: res.data.rows.rows
    const items: Gerbang[] = res?.data?.rows?.rows || [];
    setData(items);
  } catch (err) {
    console.error(err);
    setError("Gagal memuat data gerbang");
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  fetchGerbangs();
}, []);


  function handleOpenCreate() {
    setEditing(null);
    setForm({
      id: 0,
      IdCabang: 0,
      NamaGerbang: "",
      NamaCabang: "",
    });
    setOpenForm(true);
  }

  function handleOpenEdit(row: Gerbang) {
    setEditing(row);
    setForm(row);
    setOpenForm(true);
  }

  function handleCloseForm() {
    setOpenForm(false);
    setError("");
  }

  async function handleSubmit() {
    try {
      setError("");
      if (!form.id || !form.IdCabang || !form.NamaGerbang || !form.NamaCabang) {
        setError("Semua field wajib diisi");
        return;
      }

      if (editing) {
        // UPDATE
        await apiFetch('/gerbangs', {
          method: 'PUT',
          body: JSON.stringify({
            id: form.id,
            IdCabang: form.IdCabang,
            NamaGerbang: form.NamaGerbang,
            NamaCabang: form.NamaCabang,
          }),
        });

      } else {
        // CREATE
        await apiFetch('/gerbangs', {
          method: 'POST',
          body: JSON.stringify({
            id: form.id,
            IdCabang: form.IdCabang,
            NamaGerbang: form.NamaGerbang,
            NamaCabang: form.NamaCabang,
          }),
        });
      }

      await fetchGerbangs();
      setOpenForm(false);
    } catch (err) {
      console.error(err);
      setError((err as Error)?.message || "Gagal menyimpan data");
    }
  }

  async function handleDelete(row: Gerbang) {
    if (!confirm(`Yakin ingin menghapus gerbang ${row.NamaGerbang}?`)) return;
    try {
      await apiFetch('/gerbangs', {
        method: 'DELETE',
        body: JSON.stringify({
          id: row.id,
          IdCabang: row.IdCabang,
        }),
      });

      await fetchGerbangs();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data");
    }
  }

  return (
    <AppShell title="Master Data Gerbang">
      <Container sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" fontWeight="bold">
            Master Data Gerbang
          </Typography>
          <Button variant="contained" onClick={handleOpenCreate}>
            Tambah Gerbang
          </Button>
        </Box>

        {loading && <Typography>Memuat data...</Typography>}
        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}

        {!loading && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Gerbang</TableCell>
                <TableCell>ID Cabang</TableCell>
                <TableCell>Nama Gerbang</TableCell>
                <TableCell>Nama Cabang</TableCell>
                <TableCell align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={`${row.IdCabang}-${row.id}`}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.IdCabang}</TableCell>
                  <TableCell>{row.NamaGerbang}</TableCell>
                  <TableCell>{row.NamaCabang}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEdit(row)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(row)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5}>Tidak ada data gerbang.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        <Dialog
          open={openForm}
          onClose={handleCloseForm}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {editing ? "Edit Gerbang" : "Tambah Gerbang"}
          </DialogTitle>
          <DialogContent>
            <TextField
              margin="normal"
              label="ID Gerbang"
              type="number"
              fullWidth
              value={form.id}
              onChange={(e) => setForm({ ...form, id: Number(e.target.value) })}
            />
            <TextField
              margin="normal"
              label="ID Cabang (Ruas)"
              type="number"
              fullWidth
              value={form.IdCabang}
              onChange={(e) =>
                setForm({ ...form, IdCabang: Number(e.target.value) })
              }
            />
            <TextField
              margin="normal"
              label="Nama Gerbang"
              fullWidth
              value={form.NamaGerbang}
              onChange={(e) =>
                setForm({ ...form, NamaGerbang: e.target.value })
              }
            />
            <TextField
              margin="normal"
              label="Nama Cabang (Ruas)"
              fullWidth
              value={form.NamaCabang}
              onChange={(e) => setForm({ ...form, NamaCabang: e.target.value })}
            />

            {error && (
              <Typography color="error" mt={1}>
                {error}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm}>Batal</Button>
            <Button onClick={handleSubmit} variant="contained">
              Simpan
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AppShell>
  );
}
