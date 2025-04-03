import React, { useState, useEffect } from 'react';
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Tabs,
  Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface Product {
  id_produit: number;
  nom_produit: string;
  quantite_disponible: number;
  seuil_critique: number;
}

interface Dish {
  id_plat: number;
  nom_plat: string;
  description: string;
  prix: number;
}

const Stock = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: 0,
    threshold: 0
  });
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchData();
  }, [tabValue]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (tabValue === 0) {
        const response = await axios.get('http://localhost:3000/stock');
        setProducts(response.data);
      } else if (tabValue === 1) {
        const response = await axios.get('http://localhost:3000/stock/restock');
        setProducts(response.data);
      } else {
        const response = await axios.get('http://localhost:3000/stock/dish');
        setDishes(response.data);
      }
      setError(null);
    } catch (err) {
      setError('Erreur lors de la récupération des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (id: number, quantity: number) => {
    try {
      await axios.put(`http://localhost:3000/stock/${id}`, {
        quantity: quantity
      });
      fetchData();
      setSelectedProduct(null);
      setOpenDialog(false);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du produit:', err);
    }
  };

  const handleAddProduct = async () => {
    try {
      await axios.post('http://localhost:3000/stock', newProduct);
      fetchData();
      setOpenAddDialog(false);
      setNewProduct({ name: '', quantity: 0, threshold: 0 });
    } catch (err) {
      console.error('Erreur lors de l\'ajout du produit:', err);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3000/stock/${id}`);
      fetchData();
    } catch (err) {
      console.error('Erreur lors de la suppression du produit:', err);
    }
  };

  const getStatusColor = (quantity: number, threshold: number) => {
    if (quantity <= threshold) return 'error';
    if (quantity <= threshold * 2) return 'warning';
    return 'success';
  };

  if (loading) return <Typography>Chargement...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestion du Stock
        </Typography>
        {tabValue !== 2 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDialog(true)}
          >
            Ajouter un produit
          </Button>
        )}
      </Box>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Inventaire complet" />
        <Tab label="Produits à réapprovisionner" />
        <Tab label="Plats disponibles" />
      </Tabs>

      {tabValue !== 2 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Produit</TableCell>
                <TableCell>Quantité disponible</TableCell>
                <TableCell>Seuil critique</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id_produit}>
                  <TableCell>{product.id_produit}</TableCell>
                  <TableCell>{product.nom_produit}</TableCell>
                  <TableCell>{product.quantite_disponible}</TableCell>
                  <TableCell>{product.seuil_critique}</TableCell>
                  <TableCell>
                    <Chip
                      label={product.quantite_disponible <= product.seuil_critique ? 'Critique' : 'OK'}
                      color={getStatusColor(product.quantite_disponible, product.seuil_critique)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => {
                        setSelectedProduct(product);
                        setOpenDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDeleteProduct(product.id_produit)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Plat</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Prix</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dishes.map((dish) => (
                <TableRow key={dish.id_plat}>
                  <TableCell>{dish.id_plat}</TableCell>
                  <TableCell>{dish.nom_plat}</TableCell>
                  <TableCell>{dish.description}</TableCell>
                  <TableCell>${Number(dish.prix).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog pour modifier la quantité */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Modifier la quantité</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <TextField
              autoFocus
              margin="dense"
              label="Nouvelle quantité"
              type="number"
              fullWidth
              defaultValue={selectedProduct.quantite_disponible}
              onChange={(e) => {
                const newQuantity = parseInt(e.target.value);
                handleUpdateProduct(selectedProduct.id_produit, newQuantity);
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour ajouter un produit */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Ajouter un nouveau produit</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom du produit"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantité"
                type="number"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Seuil critique"
                type="number"
                value={newProduct.threshold}
                onChange={(e) => setNewProduct({ ...newProduct, threshold: parseInt(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Annuler</Button>
          <Button onClick={handleAddProduct} color="primary">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Stock; 