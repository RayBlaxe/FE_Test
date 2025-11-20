"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
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
import SearchIcon from "@mui/icons-material/Search";

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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

 async function fetchGerbangs() {
  try {
    setLoading(true);
    const res = await apiFetch("/gerbangs");

    
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

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.trim().toLowerCase();
    return data.filter((row) => {
      const text = [
        String(row.id),
        String(row.IdCabang),
        row.NamaGerbang,
        row.NamaCabang,
      ]
        .join(' ')
        .toLowerCase();
      return text.includes(q);
    });
  }, [data, search]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, rowsPerPage]);

  function changePage(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
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

        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by ID, Nama Gerbang, or Nama Cabang..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page when searching
            }}
            InputProps={{
              startAdornment: (
                <IconButton size="small" sx={{ mr: 1 }}>
                  <SearchIcon fontSize="small" />
                </IconButton>
              ),
            }}
            sx={{ maxWidth: 600 }}
          />
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
              <TableRow sx={{ bgcolor: '#f3f5f7' }}>
                <TableCell>No</TableCell>
                <TableCell>ID Cabang</TableCell>
                <TableCell>Nama Gerbang</TableCell>
                <TableCell>Nama Cabang</TableCell>
                <TableCell align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow key={`${row.IdCabang}-${row.id}`}>
                  <TableCell>{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
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
              {filteredData.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {search ? 'Tidak ada data yang sesuai dengan pencarian.' : 'Tidak ada data gerbang.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {/* Pagination Controls */}
        {!loading && filteredData.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Rows per page:</Typography>
              <Select
                size="small"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                sx={{ height: 32 }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
              <Typography variant="body2" sx={{ ml: 2 }}>
                Showing {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                disabled={currentPage <= 1}
                onClick={() => changePage(1)}
                size="small"
              >
                First
              </Button>
              <Button
                variant="outlined"
                disabled={currentPage <= 1}
                onClick={() => changePage(currentPage - 1)}
                size="small"
              >
                Prev
              </Button>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                Page {currentPage} of {totalPages}
              </Typography>
              <Button
                variant="outlined"
                disabled={currentPage >= totalPages}
                onClick={() => changePage(currentPage + 1)}
                size="small"
              >
                Next
              </Button>
              <Button
                variant="outlined"
                disabled={currentPage >= totalPages}
                onClick={() => changePage(totalPages)}
                size="small"
              >
                Last
              </Button>
            </Box>
          </Box>
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
