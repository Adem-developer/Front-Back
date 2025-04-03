import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress, useTheme, Fade, Zoom } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

interface DashboardData {
  activeOrders: number;
  totalCustomers: number;
  itemsToRestock: number;
  monthlyRevenue: number;
}

interface RevenueData {
  month: string;
  revenue: number;
}

interface OrderStatusData {
  status: string;
  count: number;
}

const COLORS = ['#2196f3', '#4caf50', '#ff9800', '#f44336'];

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<OrderStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les commandes actives
        const ordersResponse = await axios.get('http://localhost:3000/order');
        const activeOrders = ordersResponse.data.filter((order: any) => order.statut === 'EN_COURS').length;

        // Récupérer le nombre total de clients
        const customersResponse = await axios.get('http://localhost:3000/customer');
        const totalCustomers = customersResponse.data.length;

        // Récupérer les articles à réapprovisionner
        const stockResponse = await axios.get('http://localhost:3000/stock/restock');
        const itemsToRestock = stockResponse.data.length;

        // Calculer le revenu mensuel
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const monthlyOrders = ordersResponse.data.filter((order: any) => {
          const orderDate = new Date(order.date_commande);
          return orderDate.getMonth() + 1 === currentMonth && 
                 orderDate.getFullYear() === currentYear &&
                 order.statut === 'PAYE';
        });
        const monthlyRevenue = monthlyOrders.reduce((sum: number, order: any) => {
          const total = parseFloat(order.total_commande) || 0;
          return sum + total;
        }, 0);

        // Préparer les données pour les graphiques
        const revenueByMonth = Array.from({ length: 12 }, (_, i) => {
          const monthOrders = ordersResponse.data.filter((order: any) => {
            const orderDate = new Date(order.date_commande);
            return orderDate.getMonth() === i && 
                   orderDate.getFullYear() === currentYear &&
                   order.statut === 'PAYE';
          });
          const revenue = monthOrders.reduce((sum: number, order: any) => {
            const total = parseFloat(order.total_commande) || 0;
            return sum + total;
          }, 0);
          return {
            month: new Date(2000, i).toLocaleString('fr-FR', { month: 'short' }),
            revenue: revenue
          };
        });

        const ordersByStatus = ordersResponse.data.reduce((acc: any, order: any) => {
          acc[order.statut] = (acc[order.statut] || 0) + 1;
          return acc;
        }, {});

        const orderStatusData = Object.entries(ordersByStatus).map(([status, count]) => ({
          status,
          count: count as number
        }));

        setData({
          activeOrders,
          totalCustomers,
          itemsToRestock,
          monthlyRevenue
        });
        setRevenueData(revenueByMonth);
        setOrderStatusData(orderStatusData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ title, value, icon, color }: { title: string; value: number | string; icon: React.ReactNode; color: string }) => (
    <Zoom in={!loading} style={{ transitionDelay: loading ? '0ms' : '200ms' }}>
      <Paper
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          height: 160,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            backgroundColor: color,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: '50%',
              p: 1,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Typography color="textSecondary" variant="h6">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      </Paper>
    </Zoom>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error" variant="h5">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Fade in={!loading}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
          Dashboard Overview
        </Typography>
      </Fade>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Orders"
            value={data?.activeOrders || 0}
            icon={<TrendingUpIcon sx={{ color: theme.palette.primary.main }} />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value={data?.totalCustomers || 0}
            icon={<PeopleAltIcon sx={{ color: theme.palette.success.main }} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Items to Restock"
            value={data?.itemsToRestock || 0}
            icon={<Inventory2Icon sx={{ color: theme.palette.warning.main }} />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Revenue"
            value={`$${data?.monthlyRevenue?.toFixed(2) || '0.00'}`}
            icon={<AttachMoneyIcon sx={{ color: theme.palette.error.main }} />}
            color={theme.palette.error.main}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Zoom in={!loading} style={{ transitionDelay: loading ? '0ms' : '400ms' }}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Revenue by Month
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis 
                    dataKey="month" 
                    stroke={theme.palette.text.secondary}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke={theme.palette.text.secondary}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                    domain={[0, 'dataMax']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: theme.shape.borderRadius,
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    fill={theme.palette.primary.main}
                    name="Revenue"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Zoom>
        </Grid>

        <Grid item xs={12} md={4}>
          <Zoom in={!loading} style={{ transitionDelay: loading ? '0ms' : '600ms' }}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Orders by Status
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: theme.shape.borderRadius,
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Zoom>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;