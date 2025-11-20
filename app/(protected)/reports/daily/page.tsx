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
import type { Gerbang } from '@/types/gerbang';

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
  const [gerbangs, setGerbangs] = useState<Gerbang[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [page, setPage] = useState(1);

  // Fetch gerbangs
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/gerbangs?limit=1000');
        const items: Gerbang[] = res?.data?.rows?.rows || [];
        setGerbangs(items);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // default date for daily report
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
      // Fetch data for specific date
      const res = await apiFetch(`/lalins?tanggal=${encodeURIComponent(tanggal)}&limit=1000`);
      
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

  // Helper to get gerbang name
  const getGerbangName = useCallback((idCabang: number, idGerbang: number): string => {
    const gerbang = gerbangs.find(g => g.IdCabang === idCabang && g.id === idGerbang);
    return gerbang?.NamaGerbang || `Gerbang ${idGerbang}`;
  }, [gerbangs]);

  // Helper to get cabang name
  const getCabangName = useCallback((idCabang: number): string => {
    const gerbang = gerbangs.find(g => g.IdCabang === idCabang);
    return gerbang?.NamaCabang || `Ruas ${idCabang}`;
  }, [gerbangs]);

  // Get day of week from date
  const getDayName = useCallback((dateString: string): string => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const date = new Date(dateString);
    return days[date.getDay()];
  }, []);

  // Get payment method name
  const getPaymentMethodName = useCallback((tab: TabKey): string => {
    const label = TAB_LABELS.find(t => t.key === tab);
    return label?.label || tab;
  }, []);

  
  const filteredData = useMemo(() => {
    let rows = data;
    
    // Filter by selected tab (payment method)
    rows = rows.filter((row) => {
      const value = metricValue(row, tab);
      return value > 0; // Only show rows with data for selected payment method
    });
    
    // Filter by search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((row) => {
        const text = [
          getCabangName(row.IdCabang),
          getGerbangName(row.IdCabang, row.IdGerbang),
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
  }, [data, search, tab, getCabangName, getGerbangName]);

  
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
                Ruas {getCabangName(ruasId)}
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
              <TableCell>Hari</TableCell>
              <TableCell>Tanggal</TableCell>
              <TableCell>Metode Pembayaran</TableCell>
              <TableCell align="right">GOL I</TableCell>
              <TableCell align="right">GOL II</TableCell>
              <TableCell align="right">GOL III</TableCell>
              <TableCell align="right">GOL IV</TableCell>
              <TableCell align="right">GOL V</TableCell>
              <TableCell align="right">Total Lalin</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((row, i) => (
              <TableRow key={row.id} hover>
                <TableCell>{(currentPage - 1) * rowsPerPage + i + 1}</TableCell>
                <TableCell>{getCabangName(row.IdCabang)}</TableCell>
                <TableCell>{getGerbangName(row.IdCabang, row.IdGerbang)}</TableCell>
                <TableCell>{row.IdGardu}</TableCell>
                <TableCell>{getDayName(row.Tanggal)}</TableCell>
                <TableCell>{formatDate(row.Tanggal)}</TableCell>
                <TableCell>{getPaymentMethodName(tab)}</TableCell>
                <TableCell align="right">{row.Golongan === 1 ? metricValue(row, tab) : 0}</TableCell>
                <TableCell align="right">{row.Golongan === 2 ? metricValue(row, tab) : 0}</TableCell>
                <TableCell align="right">{row.Golongan === 3 ? metricValue(row, tab) : 0}</TableCell>
                <TableCell align="right">{row.Golongan === 4 ? metricValue(row, tab) : 0}</TableCell>
                <TableCell align="right">{row.Golongan === 5 ? metricValue(row, tab) : 0}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {metricValue(row, tab)}
                </TableCell>
              </TableRow>
            ))}
            {!paginated.length && (
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ py: 3 }}>
                  Tidak ada data untuk metode pembayaran ini.
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
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
          <Typography variant="body2" sx={{ ml: 2 }}>
            Showing {filteredData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} - {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            disabled={currentPage <= 1}
            onClick={() => changePage(1)}
          >
            First
          </Button>
          <Button
            variant="outlined"
            size="small"
            disabled={currentPage <= 1}
            onClick={() => changePage(currentPage - 1)}
          >
            Prev
          </Button>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
            Page {currentPage} of {totalPages}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            disabled={currentPage >= totalPages}
            onClick={() => changePage(currentPage + 1)}
          >
            Next
          </Button>
          <Button
            variant="outlined"
            size="small"
            disabled={currentPage >= totalPages}
            onClick={() => changePage(totalPages)}
          >
            Last
          </Button>
        </Box>
      </Box>
    </AppShell>
  );
}
