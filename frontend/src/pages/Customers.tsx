import React, { useState, useEffect } from 'react';
// @ts-ignore
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Tabs,
  Tab,
  Chip,
  Avatar,
  LinearProgress,
} from '@mui/material';
// @ts-ignore
import AddIcon from '@mui/icons-material/Add';
// @ts-ignore
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface Customer {
  id_client: number;
  nom: string;
  prenom: string;
  contact: string;
  points_fidelite: number;
  rank: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Customer>({
    id_client: 0,
    nom: '',
    prenom: '',
    contact: '',
    points_fidelite: 0,
    rank: '1'
  });
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, [tabValue]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const url = tabValue === 1 
        ? 'http://localhost:3000/customer/top'
        : 'http://localhost:3000/customer';
      const response = await axios.get(url);
      setCustomers(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la récupération des clients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    try {
      // Validation des champs requis
      if (!newCustomer.nom.trim()) {
        alert('Le nom est obligatoire');
        return;
      }

      const customerData = {
        last_name: newCustomer.nom.trim(),
        first_name: newCustomer.prenom.trim() || '',
        contact: newCustomer.contact.trim() || '',
        
      };

      console.log('Données envoyées:', JSON.stringify(customerData, null, 2));

      console.log(customerData);
      // Envoyer les données avec une configuration spécifique
      const response = await axios.post('http://localhost:3000/customer', customerData);

      console.log('Réponse du serveur:', response);

      if (response.data) {
        await fetchCustomers();
        setOpenAddDialog(false);
        setNewCustomer({
          id_client: 0,
          nom: '',
          prenom: '',
          contact: '',
          points_fidelite: 0,
          rank: '1'
        });
      }
    } catch (err: any) {
      console.error('Erreur détaillée:', err.response?.data || err.message);
      if (err.response?.data?.message) {
        alert(`Erreur lors de l'ajout du client: ${err.response.data.message}`);
      } else {
        alert('Erreur lors de l\'ajout du client. Veuillez réessayer.');
      }
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      return;
    }

    try {
      console.log('Tentative de suppression du client:', id); // Debug

      const response = await axios.delete(`http://localhost:3000/customer/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Réponse de suppression:', response); // Debug

      if (response.data) {
        await fetchCustomers(); // Rafraîchir la liste
      }
    } catch (err: any) {
      console.error('Erreur détaillée:', err.response?.data || err.message);
      alert(`Erreur lors de la suppression du client: ${err.response?.data?.message || err.message}`);
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case '1':
        return '#FFD700'; // Or
      case '2':
        return '#C0C0C0'; // Argent
      case '3':
        return '#CD7F32'; // Bronze
      default:
        return '#E0E0E0'; // Gris
    }
  };

  const getRankEmoji = (rank: string) => {
    switch (rank) {
      case '1':
        return '🥇';
      case '2':
        return '🥈';
      case '3':
        return '🥉';
      default:
        return rank;
    }
  };

  if (loading) return <Typography>Chargement...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestion des Clients
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          Ajouter un client
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Liste des clients" />
        <Tab label="Meilleurs clients" />
      </Tabs>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {tabValue === 1 && <TableCell>Rang</TableCell>}
                <TableCell>Client</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell align="right">Points de fidélité</TableCell>
                {tabValue === 0 && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow 
                  key={customer.id_client}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  {tabValue === 1 && (
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: getRankColor(customer.rank),
                            fontWeight: 'bold',
                          }}
                        >
                          {getRankEmoji(customer.rank)}
                        </Typography>
                        <Chip
                          label={`#${customer.rank}`}
                          size="small"
                          sx={{
                            backgroundColor: getRankColor(customer.rank),
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                      </Box>
                    </TableCell>
                  )}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {customer.prenom[0]}{customer.nom[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {customer.prenom} {customer.nom}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {customer.id_client}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{customer.contact}</TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                      {customer.points_fidelite} pts
                    </Typography>
                  </TableCell>
                  {tabValue === 0 && (
                    <TableCell>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteCustomer(customer.id_client)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog pour ajouter un client */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Ajouter un nouveau client</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom"
                value={newCustomer.nom}
                onChange={(e) => setNewCustomer({ ...newCustomer, nom: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Prénom"
                value={newCustomer.prenom}
                onChange={(e) => setNewCustomer({ ...newCustomer, prenom: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact"
                value={newCustomer.contact}
                onChange={(e) => setNewCustomer({ ...newCustomer, contact: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleAddCustomer} 
            color="primary"
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Customers; 