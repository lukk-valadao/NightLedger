export const validateExpense = (req, res, next) => {
  const { name, amount, category } = req.body;

  const errors = [];
  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push({ field: 'name', message: 'Name is required and must be a non-empty string' });
  }
  if (amount === undefined || amount === null || typeof amount !== 'number' || amount <= 0) {
    errors.push({ field: 'amount', message: 'Amount is required and must be a number greater than 0' });
  }
  if (!category || typeof category !== 'string' || category.trim() === '') {
    errors.push({ field: 'category', message: 'Category is required and must be a non-empty string' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        status: 400,
        details: errors
      }
    });
  }

  next();
};

export const validateIncome = (req, res, next) => {
  const { amount, date, notes } = req.body;

  const errors = [];
  if (amount === undefined || amount === null || typeof amount !== 'number' || amount <= 0) {
    errors.push({ field: 'amount', message: 'Amount is required and must be a number greater than 0' });
  }

  if (date) {
    const timestamp = Date.parse(date);
    if (isNaN(timestamp)) {
      errors.push({ field: 'date', message: 'Date must be a valid ISO Date string' });
    }
  }

  if (notes && typeof notes !== 'string') {
    errors.push({ field: 'notes', message: 'Notes must be a string' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        status: 400,
        details: errors
      }
    });
  }

  next();
};
