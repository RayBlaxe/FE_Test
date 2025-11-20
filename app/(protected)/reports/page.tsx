'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
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
            : (row as any)[k] ?? '';
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
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    setTanggal(iso);
  }, []);

  async function handleFilter() {
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
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Gagal memuat data lalin');
    } finally {
      setLoading(false);
    }
  }

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
    <AppShell title="Laporan Lalin Per Hari">
      {/* Filter bar */}
      <Container disableGutters sx={{ mb: 3 }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 260 }}>
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
          <Typography color="error" variant="body2" mb={1}>
            {error}
          </Typography>
        )}
      </Container>

      {/* Tabs metric */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          borderRadius: 1,
          overflow: 'hidden',
          mb: 2,
