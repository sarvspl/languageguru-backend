const express = require('express');
const prisma = require('../config/db');
const { verifyAdminToken } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', verifyAdminToken, async (req, res) => {
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

    // CFG-08: these queries are independent of one another; running them
    // sequentially cost 10+ round trips per dashboard load.
    const [
      totalQuotes,
      pendingQuotes,
      totalLanguages,
      totalCities,
      totalServices,
      completedOrders,
      settings,
      completedQuotes,
      serviceRows
    ] = await Promise.all([
      prisma.quoteRequest.count({ where: whereClause }),
      prisma.quoteRequest.count({ where: { ...whereClause, status: 'PENDING' } }),
      prisma.language.count(),
      prisma.city.count(),
      prisma.service.count(),
      prisma.quoteRequest.count({ where: { ...whereClause, status: 'COMPLETED' } }),
      prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
      prisma.quoteRequest.findMany({
        where: { ...whereClause, status: 'COMPLETED' },
        select: { pages: true, createdAt: true, serviceKey: true, isInterpreter: true },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.service.findMany({ select: { key: true, name: true, price: true } })
    ]);

    const pricePerPage = settings?.pricePerPage || 850;

    // BUG-12: value each completed quote at its own service rate. Charging a
    // ₹7,500/day interpreting job at the flat page rate understated revenue.
    const priceByKey = new Map();
    serviceRows.forEach(sv => {
      if (sv.price == null) return;
      if (sv.key) priceByKey.set(String(sv.key).toLowerCase(), sv.price);
      if (sv.name) priceByKey.set(String(sv.name).toLowerCase(), sv.price);
    });
    const quoteValue = (q) => {
      const key = (q.serviceKey || '').toLowerCase().trim();
      const unitPrice = priceByKey.get(key) ?? pricePerPage;
      // Interpreting is billed per day, not per page.
      const units = q.isInterpreter ? Math.max(q.pages || 1, 1) : (q.pages || 0);
      return units * unitPrice;
    };

    let revenue = 0;
    completedQuotes.forEach(q => {
      revenue += quoteValue(q);
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
          chartValues[6 - diffDays] += quoteValue(q);
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
          chartValues[3 - weekIdx] += quoteValue(q);
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
          chartValues[11 - diffMonths] += quoteValue(q);
        }
      });
    }

    // BUG-13: the old version mixed an exact `notIn` with a substring `contains`,
    // so a key like "training-basic" was counted as both translation and training
    // and the four buckets did not sum to the total. Classify each row once.
    const [routingRows, recentOrdersRaw] = await Promise.all([
      prisma.quoteRequest.findMany({
        where: whereClause,
        select: { serviceKey: true, isInterpreter: true }
      }),
      prisma.quoteRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 5 })
    ]);

    const leadRouting = { translation: 0, interpreter: 0, apostille: 0, training: 0 };
    routingRows.forEach(q => {
      const key = (q.serviceKey || '').toLowerCase();
      if (q.isInterpreter) leadRouting.interpreter++;
      else if (key.includes('training')) leadRouting.training++;
      else if (key.includes('apostille') || key.includes('attestation')) leadRouting.apostille++;
      else leadRouting.translation++;
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
        a: `₹${quoteValue(q).toLocaleString('en-IN')}`,
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
        leadRouting,
        recentOrders,
        recentQuotes: recentOrdersRaw
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
