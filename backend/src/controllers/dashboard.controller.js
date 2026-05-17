import * as dashboardService from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/response.js';

export const getDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    // Default to query params or current system month (1-12) and year
    const month = req.query.month ? parseInt(req.query.month, 10) : today.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year, 10) : today.getFullYear();

    const data = await dashboardService.getMonthlyDashboardData(month, year);
    return sendSuccess(res, data, `Monthly stats fetched for ${month}/${year} successfully`);
  } catch (error) {
    next(error);
  }
};
