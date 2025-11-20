'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { AppShell } from '@/components/layout/AppShell';
import { apiFetch } from '@/lib/http';
import type { Lalin } from '@/types/lalin';
import type { Gerbang } from '@/types/gerbang';
import {
  Bar,
  BarChart,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';


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

function formatDateShort(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}


const COLORS = ['#1d3a8d', '#ffcc03', '#2596be', '#22c55e', '#a855f7', '#f97316', '#0ea5e9'];

export default function DashboardPage() {
  const [tanggal, setTanggal] = useState('');
  const [search, setSearch] = useState('');
  const [lalins, setLalins] = useState<Lalin[]>([]);
  const [gerbangs, setGerbangs] = useState<Gerbang[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
  useEffect(() => {
    (async () => {
      try {
        // Fetch all gerbangs with large limit
        const res = await apiFetch('/gerbangs?limit=1000');
        const items: Gerbang[] = res?.data?.rows?.rows || [];
        setGerbangs(items);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // No default date - fetch all dates
  useEffect(() => {
    setTanggal('');
  }, []);

  // Auto-fetch 
  const handleFilter = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      // Fetch all data with large limit to get all records
      // If no date specified, fetch all
      const url = tanggal 
        ? `/lalins?tanggal=${encodeURIComponent(tanggal)}&limit=1000`
        : `/lalins?limit=1000`;
      const res = await apiFetch(url);
      const items: Lalin[] = res?.data?.rows?.rows || [];
      setLalins(items);
    } catch (err) {
      console.error(err);
      setError((err as Error)?.message || 'Gagal memuat data lalin');
    } finally {
      setLoading(false);
    }
  }, [tanggal]);

  useEffect(() => {
    handleFilter();
  }, [handleFilter]);

  function handleReset() {
    setSearch('');
    setLalins([]);
    setError('');
  }

  // Mapping 
  const gerbangNameMap = useMemo(() => {
    const map = new Map<string, string>(); 
    for (const g of gerbangs) {
      const key = `${g.IdCabang}-${g.id}`;
      map.set(key, g.NamaGerbang);
    }
    return map;
  }, [gerbangs]);

  const cabangNameMap = useMemo(() => {
    const map = new Map<number, string>(); 
    for (const g of gerbangs) {
      if (!map.has(g.IdCabang)) {
        map.set(g.IdCabang, g.NamaCabang);
      }
    }
    return map;
  }, [gerbangs]);

  const getGerbangLabel = useMemo(() => {
    return (row: Lalin) => {
      const key = `${row.IdCabang}-${row.IdGerbang}`;
      const n = gerbangNameMap.get(key);
      return n ? n : `Gerbang ${row.IdGerbang}`;
    };
  }, [gerbangNameMap]);

  const getCabangLabel = useMemo(() => {
    return (idCabang: number) => {
      const n = cabangNameMap.get(idCabang);
      return n ? n : `Ruas ${idCabang}`;
    };
  }, [cabangNameMap]);


  const filteredLalins = useMemo(() => {
    let rows = lalins;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((row) => {
        const text = [
          getGerbangLabel(row),
          getCabangLabel(row.IdCabang),
          `Shift ${row.Shift}`,
          `Gol ${row.Golongan}`,
          `Gardu ${row.IdGardu}`,
        ]
          .join(' ')
          .toLowerCase();
        return text.includes(q);
      });
    }
    return rows;
  }, [lalins, search, getGerbangLabel, getCabangLabel]);

  
  const paymentChartData = useMemo(() => {
   
    let bca = 0;
    let bri = 0;
    let bni = 0;
    let dki = 0;
    let mandiri = 0;
    let flo = 0;
    let ktp = 0;

    for (const row of filteredLalins) {
      bca += row.eBca;
      bri += row.eBri;
      bni += row.eBni;
      dki += row.eDKI;
      mandiri += row.eMandiri;
      flo += row.eFlo;
      ktp += row.DinasOpr + row.DinasMitra + row.DinasKary;
    }

    return [
      { method: 'BCA', value: bca },
      { method: 'BRI', value: bri },
      { method: 'BNI', value: bni },
      { method: 'DKI', value: dki },
      { method: 'Mandiri', value: mandiri },
      { method: 'Flo', value: flo },
      { method: 'KTP', value: ktp },
    ];
  }, [filteredLalins]);


  const gateChartData = useMemo(() => {
    const map = new Map<string, number>(); 
    for (const row of filteredLalins) {
      const label = getGerbangLabel(row);
      map.set(label, (map.get(label) || 0) + totalAll(row));
    }
    return Array.from(map.entries()).map(([name, value]) => ({
      gerbang: name,
      value,
    }));
  }, [filteredLalins, getGerbangLabel]);


  const shiftPieData = useMemo(() => {
    const map = new Map<number, number>();
    for (const row of filteredLalins) {
      map.set(row.Shift, (map.get(row.Shift) || 0) + totalAll(row));
    }
    return Array.from(map.entries()).map(([shift, value]) => ({
      name: `Shift ${shift}`,
      value,
    }));
  }, [filteredLalins]);


  const cabangPieData = useMemo(() => {
    const map = new Map<number, number>();
    for (const row of filteredLalins) {
      map.set(row.IdCabang, (map.get(row.IdCabang) || 0) + totalAll(row));
    }
    return Array.from(map.entries()).map(([idCabang, value]) => ({
      name: getCabangLabel(idCabang),
      value,
    }));
  }, [filteredLalins, getCabangLabel]);

  return (
    <AppShell title="Dashboard">
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
        {/* Search all */}
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 260 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search (ruas, gerbang, shift...)"
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

        {/* Date filter */}
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
        </Box>
      </Box>
      {error && (
        <Typography color="error" variant="body2" mb={2}>
          {error}
        </Typography>
      )}
      {!!filteredLalins.length && (
        <Typography variant="body2" color="text.secondary" mb={3}>
          Total baris data: {filteredLalins.length.toLocaleString('id-ID')}
        </Typography>
      )}

      {/* Grafik 1 */}
      <Box mb={4}>
        <Typography variant="subtitle1" mb={1}>
          Jumlah Lalin per Metode Pembayaran ({tanggal && formatDateShort(tanggal)})
        </Typography>
        <Box sx={{ height: 280, bgcolor: '#f3f5f7', borderRadius: 1, p: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paymentChartData}>
              <XAxis dataKey="method" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Jumlah Lalin">
                {paymentChartData.map((entry, index) => (
                  <Cell key={entry.method} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Grafik 2 */}
      <Box mb={4}>
        <Typography variant="subtitle1" mb={1}>
          Jumlah Lalin per Gerbang ({tanggal && formatDateShort(tanggal)})
        </Typography>
        <Box sx={{ height: 280, bgcolor: '#f3f5f7', borderRadius: 1, p: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gateChartData}>
              <XAxis dataKey="gerbang" tick={{ fontSize: 10 }} interval={0} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Jumlah Lalin">
                {gateChartData.map((entry, index) => (
                  <Cell key={entry.gerbang} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Grafik 3 & 4 */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        {/* Pie Shift */}
        <Box>
          <Typography variant="subtitle1" mb={1}>
            Komposisi Lalin per Shift
          </Typography>
          <Box sx={{ height: 260, bgcolor: '#f3f5f7', borderRadius: 1, p: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shiftPieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {shiftPieData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* Pie Chart Ruas */}
        <Box>
          <Typography variant="subtitle1" mb={1}>
            Komposisi Lalin per Ruas/Cabang
          </Typography>
          <Box sx={{ height: 260, bgcolor: '#f3f5f7', borderRadius: 1, p: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cabangPieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {cabangPieData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Box>
    </AppShell>
  );
}
