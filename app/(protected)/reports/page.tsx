'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Button,
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GetAppIcon from '@mui/icons-material/GetApp';
import { AppShell } from '@/components/layout/AppShell';
import { apiFetch } from '@/lib/http';
import type { Lalin } from '@/types/lalin';

type TabKey =
  | 'tunai'
  | 'etoll'
  | 'flo'
  | 'ktp'
  | 'all'
  | 'combo';

const TAB_LABELS: { key: TabKey; label: string }[] = [
  { key: 'tunai', label: 'Total Tunai' },
  { key: 'etoll', label: 'Total E-Toll' },
  { key: 'flo', label: 'Total Flo' },
  { key: 'ktp', label: 'Total KTP' },
  { key: 'all', label: 'Total Keseluruhan' },
  { key: 'combo', label: 'Total E-Toll+Tunai+Flo' },
];

// helper 
function etoll(row: Lalin) {
  return (
    row.eMandiri +
    row.eBri +
    row.eBni +
    row.eBca +
    row.eNobu +
    row.eDKI +
    row.eMega
  );
}

function ktp(row: Lalin) {
  return row.DinasOpr + row.DinasMitra + row.DinasKary;
}

function totalAll(row: Lalin) {
  return row.Tunai + etoll(row) + ktp(row) + row.eFlo;
}

function metricValue(row: Lalin, tab: TabKey): number {
  switch (tab) {
    case 'tunai':
      return row.Tunai;
    case 'etoll':
      return etoll(row);
    case 'flo':
      return row.eFlo;
    case 'ktp':
      return ktp(row);
    case 'combo':
      return row.Tunai + etoll(row) + row.eFlo;
    case 'all':
    default:
      return totalAll(row);
  }
}

function formatDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

// export
function toCsv(data: Lalin[]): string {
  if (!data.length) return '';
  const keys = [
    'IdCabang',
    'IdGerbang',
    'IdGardu',
    'Shift',
    'Golongan',
    'Tanggal',
    'Tunai',
    'DinasOpr',
    'DinasMitra',
    'DinasKary',
    'eMandiri',
    'eBri',
    'eBni',
    'eBca',
    'eNobu',
    'eDKI',
    'eMega',
    'eFlo',
  ];
  const header = keys.join(',');
  const rows = data.map((row) =>
    keys
      .map((k) => {
        const val =
          k === 'Tanggal'
            ? formatDate(row.Tanggal)
            : row[k as keyof Lalin] ?? '';
        const s = String(val).replace(/"/g, '""');
        return `"${s}"`;
      })
      .join(',')
  );
  return [header, ...rows].join('\n');
}

export default function ReportsPage() {
  const [tanggal, setTanggal] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<TabKey>('tunai');
  const [data, setData] = useState<Lalin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(1);

  // today default
  useEffect(() => {
    setTanggal('2023-11-01');
  }, []);

  // Auto-fetch data 
  const handleFilter = useCallback(async () => {
    if (!tanggal) {
      setError('Tanggal harus diisi.');
      return;
    }
    setError('');
    setLoading(true);
    setPage(1);
    try {
      const res = await apiFetch(`/lalins?tanggal=${encodeURIComponent(tanggal)}`);
      
      const items: Lalin[] = res?.data?.rows?.rows || [];
      setData(items);
    } catch (err) {
      console.error(err);
      setError((err as Error)?.message || 'Gagal memuat data lalin');
    } finally {
      setLoading(false);
    }
  }, [tanggal]);

  useEffect(() => {
    if (tanggal) {
      handleFilter();
    }
  }, [tanggal, handleFilter]);

  function handleReset() {
    setSearch('');
    setTab('tunai');
    setPage(1);
  }

  
  const filteredData = useMemo(() => {
    let rows = data;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((row) => {
        const text = [
          `Ruas ${row.IdCabang}`,
          `Gerbang ${row.IdGerbang}`,
          `Gardu ${row.IdGardu}`,
          `Shift ${row.Shift}`,
          `Gol ${row.Golongan}`,
          formatDate(row.Tanggal),
        ]
          .join(' ')
          .toLowerCase();
        return text.includes(q);
      });
    }
    return rows;
  }, [data, search]);

  
  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / rowsPerPage)
  );
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, rowsPerPage]);

  // summary 
  const summaryPerRuas = useMemo(() => {
    const map = new Map<number, number>();
    for (const row of filteredData) {
      const ruasId = row.IdCabang;
      const val = metricValue(row, tab);
      map.set(ruasId, (map.get(ruasId) || 0) + val);
    }
    return Array.from(map.entries()); 
  }, [filteredData, tab]);

  const grandTotal = useMemo(
    () => summaryPerRuas.reduce((sum, [, v]) => sum + v, 0),
    [summaryPerRuas]
  );

  function handleExport() {
    const csv = toCsv(filteredData);
    if (!csv) return;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_lalin_${tanggal || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function changePage(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  }

  return (
    <AppShell title="Laporan Lalu Lintas Per Hari">
      {/* Filter bar */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 260 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search (ruas, gerbang, gardu, shift...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <IconButton size="small" sx={{ mr: 1 }}>
                  <SearchIcon fontSize="small" />
                </IconButton>
              ),
            }}
          />
        </Box>

        {/* Date */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            label="Tanggal"
            type="date"
            size="small"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {/* Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" onClick={handleFilter} disabled={loading}>
            {loading ? 'Loading...' : 'Filter'}
          </Button>
          <Button variant="outlined" onClick={handleReset}>
            Reset
          </Button>
          <Button
            variant="outlined"
            startIcon={<GetAppIcon />}
            onClick={handleExport}
            disabled={!filteredData.length}
          >
            Export
          </Button>
        </Box>
      </Box>
      {error && (
        <Typography color="error" variant="body2" mb={2}>
          {error}
        </Typography>
      )}

      {/* Tabs metric */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          borderRadius: 1,
          overflow: 'hidden',
          mb: 2,
          border: '1px solid #e0e0e0',
        }}
      >
        {TAB_LABELS.map((t) => {
          const active = tab === t.key;
          return (
            <Button
              key={t.key}
              variant={active ? 'contained' : 'text'}
              onClick={() => setTab(t.key)}
              sx={{
                borderRadius: 0,
                flex: 1,
                minWidth: 120,
                bgcolor: active ? 'primary.main' : '#fff',
                color: active ? '#fff' : 'text.primary',
                '&:hover': {
                  bgcolor: active ? 'primary.dark' : '#f5f5f5',
                },
              }}
            >
              {t.label}
            </Button>
          );
        })}
      </Box>

      {/* Summary */}
      <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Summary ({TAB_LABELS.find((t) => t.key === tab)?.label})
        </Typography>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {summaryPerRuas.map(([ruasId, val]) => (
            <Box key={ruasId}>
              <Typography variant="caption" color="text.secondary">
                Ruas {ruasId}
              </Typography>
              <Typography variant="h6">{val.toLocaleString('id-ID')}</Typography>
            </Box>
          ))}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Grand Total
            </Typography>
            <Typography variant="h6" color="primary">
              {grandTotal.toLocaleString('id-ID')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Table */}
      <Box sx={{ overflowX: 'auto', mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f3f5f7' }}>
              <TableCell>No</TableCell>
              <TableCell>Ruas</TableCell>
              <TableCell>Gerbang</TableCell>
              <TableCell>Gardu</TableCell>
              <TableCell>Shift</TableCell>
              <TableCell>Gol</TableCell>
              <TableCell align="right">Tunai</TableCell>
              <TableCell align="right">E-Toll</TableCell>
              <TableCell align="right">Flo</TableCell>
              <TableCell align="right">KTP</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((row, i) => (
              <TableRow key={row.id} hover>
                <TableCell>{(currentPage - 1) * rowsPerPage + i + 1}</TableCell>
                <TableCell>{row.IdCabang}</TableCell>
                <TableCell>{row.IdGerbang}</TableCell>
                <TableCell>{row.IdGardu}</TableCell>
                <TableCell>{row.Shift}</TableCell>
                <TableCell>{row.Golongan}</TableCell>
                <TableCell align="right">{row.Tunai}</TableCell>
                <TableCell align="right">{etoll(row)}</TableCell>
                <TableCell align="right">{row.eFlo}</TableCell>
                <TableCell align="right">{ktp(row)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {totalAll(row)}
                </TableCell>
              </TableRow>
            ))}
            {!paginated.length && (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Pagination */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
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
            Page {currentPage} of {totalPages}
          </Typography>
        </Box>
        <Box>
          <Button
            disabled={currentPage <= 1}
            onClick={() => changePage(currentPage - 1)}
          >
            Prev
          </Button>
          <Button
            disabled={currentPage >= totalPages}
            onClick={() => changePage(currentPage + 1)}
          >
            Next
          </Button>
        </Box>
      </Box>
    </AppShell>
  );
}
