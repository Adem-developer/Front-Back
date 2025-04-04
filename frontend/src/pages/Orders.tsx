import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
// @ts-ignore
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';

interface Order {
  id_commande: number;
  id_client: number;
  id_employe: number;
  date_commande: string;
  total_commande: string | number;
  statut: string;
  details?: OrderDetail[];
  client?: {
    nom: string;
    prenom: string;
  };
}

interface OrderDetail {
  id_plat: number;
  nom_plat: string;
  description: string;
  prix: number;
  quantite: number;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newOrder, setNewOrder] = useState({
    id_client: '',
    id_employe: '',
    total_commande: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/order');
      const allOrders = response.data;
      
      // Récupérer les informations des clients pour chaque commande
      const ordersWithClients = await Promise.all(
        allOrders.map(async (order: Order) => {
          try {
            const clientResponse = await axios.get(`http://localhost:3000/customer/${order.id_client}`);
            return {
              ...order,
              client: clientResponse.data
            };
          } catch (err) {
            console.error('Erreur lors de la récupération des informations du client:', err);
            return order;
          }
        })
      );
      
      setOrders(ordersWithClients);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la récupération des commandes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await axios.put(`http://localhost:3000/order/status/${orderId}`, { status: newStatus });
      fetchOrders(); // Rafraîchir la liste des commandes
      setOpenStatusDialog(false);
    } catch (err) {
      console.error('Erreur lors de la modification du statut:', err);
    }
  };

  const handleViewDetails = async (orderId: number) => {
    try {
      const response = await axios.get(`http://localhost:3000/order/details/${orderId}`);
      setSelectedOrder(response.data);
      setOpenDialog(true);
    } catch (err) {
      console.error('Erreur lors de la récupération des détails:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EN_COURS':
        return 'warning';
      case 'PAYE':
        return 'success';
      case 'ANNULE':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleViewOrder = (order: Order) => {
    handleViewDetails(order.id_commande);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setOpenStatusDialog(true);
  };

  const handleDeleteOrder = async (orderId: number) => {
    try {
      await axios.delete(`http://localhost:3000/order/${orderId}`);
      fetchOrders();
    } catch (err) {
      console.error('Erreur lors de la suppression de la commande:', err);
    }
  };

  const handleAddOrder = () => {
    setOpenAddDialog(true);
  };

  const handleSaveOrder = async () => {
    try {
      const response = await axios.post('http://localhost:3000/order', {
        id_client: parseInt(newOrder.id_client),
        id_employe: parseInt(newOrder.id_employe),
        total_commande: parseFloat(newOrder.total_commande)
      });

      if (response.data) {
        await fetchOrders();
        setOpenAddDialog(false);
        setNewOrder({
          id_client: '',
          id_employe: '',
          total_commande: ''
        });
      }
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la commande:', err);
      alert('Erreur lors de l\'ajout de la commande');
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <Typography>Chargement...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Orders Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddOrder}
        >
          Add Order
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Client ID</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((order) => (
                  <TableRow key={order.id_commande}>
                    <TableCell>{order.id_commande}</TableCell>
                    <TableCell>{formatDate(order.date_commande)}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.statut}
                        color={getStatusColor(order.statut)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>${typeof order.total_commande === 'string' ? parseFloat(order.total_commande).toFixed(2) : order.total_commande.toFixed(2)}</TableCell>
                    <TableCell>{order.id_client}</TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleViewOrder(order)}
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton 
                        color="secondary" 
                        onClick={() => handleEditOrder(order)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteOrder(order.id_commande)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={orders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Dialog pour les détails de la commande */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Détails de la commande</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">Informations générales</Typography>
                  <Typography>ID: {selectedOrder.id_commande}</Typography>
                  <Typography>Client: {selectedOrder.client ? `${selectedOrder.client.nom} ${selectedOrder.client.prenom}` : `Client ${selectedOrder.id_client}`}</Typography>
                  <Typography>Date: {formatDate(selectedOrder.date_commande)}</Typography>
                  <Typography>Total: ${typeof selectedOrder.total_commande === 'string' ? parseFloat(selectedOrder.total_commande).toFixed(2) : selectedOrder.total_commande.toFixed(2)}</Typography>
                  <Typography>Statut: {selectedOrder.statut}</Typography>
                </Grid>
                {selectedOrder.details && selectedOrder.details.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 2 }}>Détails des plats</Typography>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Plat</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Prix unitaire</TableCell>
                            <TableCell>Quantité</TableCell>
                            <TableCell>Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedOrder.details.map((detail) => (
                            <TableRow key={detail.id_plat}>
                              <TableCell>{detail.nom_plat}</TableCell>
                              <TableCell>{detail.description}</TableCell>
                              <TableCell>${detail.prix.toFixed(2)}</TableCell>
                              <TableCell>{detail.quantite}</TableCell>
                              <TableCell>${(detail.prix * detail.quantite).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour changer le statut */}
      <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)}>
        <DialogTitle>Changer le statut de la commande</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Nouveau statut"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            sx={{ mt: 2 }}
          >
            <MenuItem value="EN_COURS">En cours</MenuItem>
            <MenuItem value="PAYE">Payé</MenuItem>
            <MenuItem value="ANNULE">Annulé</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatusDialog(false)}>Annuler</Button>
          <Button 
            onClick={() => selectedOrder && handleStatusChange(selectedOrder.id_commande, newStatus)}
            color="primary"
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour ajouter une commande */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Ajouter une nouvelle commande</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ID Client"
                type="number"
                value={newOrder.id_client}
                onChange={(e) => setNewOrder({ ...newOrder, id_client: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ID Employé"
                type="number"
                value={newOrder.id_employe}
                onChange={(e) => setNewOrder({ ...newOrder, id_employe: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Total Commande"
                type="number"
                value={newOrder.total_commande}
                onChange={(e) => setNewOrder({ ...newOrder, total_commande: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Annuler</Button>
          <Button onClick={handleSaveOrder} color="primary">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders; 