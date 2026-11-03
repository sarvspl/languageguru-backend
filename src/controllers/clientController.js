const prisma = require('../config/db');

// Helper to retrieve clients from ClientsPage singleton (which Admin manages)
async function getClientsFromPageOrDb() {
  try {
    const clientsPage = await prisma.clientsPage.findUnique({
      where: { id: 'singleton' }
    });
    if (clientsPage && clientsPage.clientsList) {
      let list = [];
      try {
        list = typeof clientsPage.clientsList === 'string'
          ? JSON.parse(clientsPage.clientsList)
          : clientsPage.clientsList;
      } catch (e) {
        list = [];
      }
      if (Array.isArray(list) && list.length > 0) {
        return list.map((c, idx) => ({
          id: c.id || `client-${idx + 1}`,
          name: c.name || '',
          logo: c.logo || c.icon || '',
          icon: c.icon || c.logo || '',
          category: c.category || c.industry || 'Corporate',
          industry: c.category || c.industry || 'Corporate',
          isActive: c.isActive !== undefined ? c.isActive : true,
          sortOrder: idx + 1
        }));
      }
    }
  } catch (err) {
    console.warn('Error reading clients from ClientsPage:', err && err.message ? err.message : err);
  }

  return await prisma.client.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' }
  });
}

// Get active clients (public) - prioritizes ClientsPage singleton
exports.getClients = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const clients = await getClientsFromPageOrDb();
    res.json({ success: true, data: clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Get all clients
exports.getAllClients = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const clients = await getClientsFromPageOrDb();
    res.json({ success: true, data: clients });
  } catch (error) {
    console.error('Error fetching all clients:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Create client
exports.createClient = async (req, res) => {
  try {
    const { name, logo, isActive, sortOrder } = req.body;
    const client = await prisma.client.create({
      data: {
        name,
        logo,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0
      }
    });
    res.status(201).json({ success: true, data: client });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Update client
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo, isActive, sortOrder } = req.body;

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        logo: logo !== undefined ? logo : existing.logo,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : existing.sortOrder
      }
    });
    res.json({ success: true, data: client });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Delete client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Client not found' });

    await prisma.client.delete({ where: { id } });
    res.json({ success: true, message: 'Client deleted successfully.' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
