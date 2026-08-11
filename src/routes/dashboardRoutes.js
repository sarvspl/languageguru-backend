const express = require('express');
const prisma = require('../config/db');

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const filter = req.query.filter || 'all';
    const now = new Date();
    let dateFilter = undefined;

    if (filter === 'daily') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { gte: startOfToday };
    } else if (filter === 'weekly') {
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      dateFilter = { gte: lastWeek };
    } else if (filter === 'monthly') {
      const lastMonth = new Date(now);
      lastMonth.setDate(lastMonth.getDate() - 30);
      dateFilter = { gte: lastMonth };
    } else if (filter === 'yearly') {
      const lastYear = new Date(now);
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      dateFilter = { gte: lastYear };
    }

    const whereClause = dateFilter ? { createdAt: dateFilter } : {};

    const totalQuotes = await prisma.quoteRequest.count({ where: whereClause });
    const pendingQuotes = await prisma.quoteRequest.count({ where: { ...whereClause, status: 'PENDING' } });
    
    const totalLanguages = await prisma.language.count();
    const totalCities = await prisma.city.count();
    const totalServices = await prisma.service.count();

    const completedOrders = await prisma.quoteRequest.count({
      where: { ...whereClause, status: 'COMPLETED' }
    });

    const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
    const pricePerPage = settings?.pricePerPage || 850;

    const completedQuotes = await prisma.quoteRequest.findMany({
      where: { ...whereClause, status: 'COMPLETED' },
      select: { pages: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
    });
    
    let revenue = 0;
    completedQuotes.forEach(q => {
      revenue += (q.pages || 0) * pricePerPage;
    });

    let chartLabels = [];
    let chartValues = [];

    if (filter === 'daily' || filter === 'weekly') {
      chartLabels = Array.from({length: 7}, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      });
      chartValues = new Array(7).fill(0);
      completedQuotes.forEach(q => {
        const diffTime = now.getTime() - q.createdAt.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 6 && diffDays >= 0) {
          chartValues[6 - diffDays] += (q.pages || 0) * pricePerPage;
        }
      });
    } else if (filter === 'monthly') {
      chartLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      chartValues = new Array(4).fill(0);
      completedQuotes.forEach(q => {
        const diffTime = now.getTime() - q.createdAt.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 30 && diffDays >= 0) {
          let weekIdx = Math.floor(diffDays / 7);
          if (weekIdx > 3) weekIdx = 3;
          chartValues[3 - weekIdx] += (q.pages || 0) * pricePerPage;
        }
      });
    } else {
      chartLabels = Array.from({length: 12}, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        return d.toLocaleDateString('en-US', { month: 'short' });
      });
      chartValues = new Array(12).fill(0);
      completedQuotes.forEach(q => {
        const diffMonths = (now.getFullYear() - q.createdAt.getFullYear()) * 12 + (now.getMonth() - q.createdAt.getMonth());
        if (diffMonths <= 11 && diffMonths >= 0) {
          chartValues[11 - diffMonths] += (q.pages || 0) * pricePerPage;
        }
      });
    }

    const translationLeads = await prisma.quoteRequest.count({
      where: { ...whereClause, isInterpreter: false, serviceKey: { notIn: ['apostille', 'attestation', 'training'] } }
    });
    const interpreterLeads = await prisma.quoteRequest.count({
      where: { ...whereClause, isInterpreter: true }
    });
    const apostilleLeads = await prisma.quoteRequest.count({
      where: { ...whereClause, serviceKey: { in: ['apostille', 'attestation'] } }
    });
    const trainingLeads = await prisma.quoteRequest.count({
      where: { ...whereClause, serviceKey: { contains: 'training' } }
    });

    const recentOrdersRaw = await prisma.quoteRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const recentOrders = recentOrdersRaw.map(q => {
      const statusColors = {
        PENDING: { sc: '#fef9c3', tc: '#854d0e' },
        CONTACTED: { sc: '#dbeafe', tc: '#1d4ed8' },
        IN_PROGRESS: { sc: '#e0e7ff', tc: '#3730a3' },
        COMPLETED: { sc: '#d1fae5', tc: '#065f46' },
        CANCELLED: { sc: '#fee2e2', tc: '#b91c1c' },
      };
      const colors = statusColors[q.status] || statusColors.PENDING;
      const langText = (q.sourceLang || 'General') + (q.targetLang ? `→${q.targetLang}` : '');
      return {
        id: q.id,
        o: `ORD-${q.createdAt.getFullYear()}-${q.id.substring(0, 5).toUpperCase()}`,
        l: langText,
        p: `${q.pages} pg`,
        a: `₹${(q.pages * pricePerPage).toLocaleString('en-IN')}`,
        s: q.status.replace('_', ' '),
        sc: colors.sc,
        tc: colors.tc,
        date: q.createdAt
      };
    });

    res.json({
      success: true,
      data: {
        totalQuotes,
        pendingQuotes,
        totalLanguages,
        totalCities,
        totalServices,
        completedOrders,
        revenue,
        chartLabels,
        chartValues,
        leadRouting: {
          translation: translationLeads,
          interpreter: interpreterLeads,
          apostille: apostilleLeads,
          training: trainingLeads
        },
        recentOrders
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
