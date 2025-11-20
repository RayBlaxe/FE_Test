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
        // Fetch all gerbangs
        const res = await apiFetch('/gerbangs?limit=1000');
        const items: Gerbang[] = res?.data?.rows?.rows || [];
        setGerbangs(items);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // fetch all dates
  useEffect(() => {
    setTanggal('');
  }, []);

  // Auto-fetch 
  const handleFilter = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      // Fetch data with large limit
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

  // Calculate totals
  const totalLalinByPayment = useMemo(() => {
    return paymentChartData.reduce((sum, item) => sum + item.value, 0);
  }, [paymentChartData]);

  const totalLalinByGate = useMemo(() => {
    return gateChartData.reduce((sum, item) => sum + item.value, 0);
  }, [gateChartData]);

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

      {/* Charts Container */}
      {filteredLalins.length > 0 && (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Row 1 */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: 4,
          }}
        >
          {/* Bar Chart 1 */}
          <Box>
            <Typography variant="h6" mb={1} fontWeight={600}>
              Jumlah Lalin per Metode Pembayaran
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: '#f8fafc',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                minHeight: 380,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ height: 300, flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <BarChart data={paymentChartData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="method" type="category" width={80} />
                    <Tooltip
                      formatter={(value: number) => value.toLocaleString('id-ID')}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 4,
                      }}
                    />
                    <Bar dataKey="value" name="Jumlah Lalin" radius={[0, 4, 4, 0]}>
                      {paymentChartData.map((entry, index) => (
                        <Cell key={entry.method} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Total Lalin (Semua Metode)
                </Typography>
                <Typography variant="h6" color="primary" fontWeight={600}>
                  {totalLalinByPayment.toLocaleString('id-ID')}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Pie Chart 1 */}
          <Box>
            <Typography variant="h6" mb={1} fontWeight={600}>
              Komposisi Lalin per Shift
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: '#f8fafc',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                minHeight: 380,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ height: 330, flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height="100%" minHeight={330}>
                  <PieChart>
                    <Pie
                      data={shiftPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) =>
                        `${name}: ${((percent || 0) * 100).toFixed(1)}%`
                      }
                    >
                      {shiftPieData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => value.toLocaleString('id-ID')}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 4,
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry: any) => (
                        <span style={{ color: '#475569', fontSize: 13 }}>
                          {value}: {(entry?.payload?.value || 0).toLocaleString('id-ID')}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Row 2 */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: 4,
          }}
        >
          {/* Bar Chart 2 */}
          <Box>
            <Typography variant="h6" mb={1} fontWeight={600}>
              Jumlah Lalin per Gerbang
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: '#f8fafc',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                minHeight: 380,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ height: 300, flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <BarChart data={gateChartData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="gerbang" type="category" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number) => value.toLocaleString('id-ID')}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 4,
                      }}
                    />
                    <Bar dataKey="value" name="Jumlah Lalin" radius={[0, 4, 4, 0]}>
                      {gateChartData.map((entry, index) => (
                        <Cell key={entry.gerbang} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Total Lalin (Semua Gerbang)
                </Typography>
                <Typography variant="h6" color="primary" fontWeight={600}>
                  {totalLalinByGate.toLocaleString('id-ID')}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Pie Chart 2 */}
          <Box>
            <Typography variant="h6" mb={1} fontWeight={600}>
              Komposisi Lalin per Ruas/Cabang
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: '#f8fafc',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                minHeight: 380,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ height: 330, flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height="100%" minHeight={330}>
                  <PieChart>
                    <Pie
                      data={cabangPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) =>
                        `${name}: ${((percent || 0) * 100).toFixed(1)}%`
                      }
                    >
                      {cabangPieData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => value.toLocaleString('id-ID')}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 4,
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry: any) => (
                        <span style={{ color: '#475569', fontSize: 13 }}>
                          {value}: {(entry?.payload?.value || 0).toLocaleString('id-ID')}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      )}

      {/* No Data Message */}
      {filteredLalins.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Tidak ada data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Silakan pilih tanggal atau gunakan filter untuk melihat data.
          </Typography>
        </Box>
      )}
    </AppShell>
  );
}
