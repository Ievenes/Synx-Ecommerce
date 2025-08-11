function validate(schema) {
  return (req, res, next) => {
    const errors = [];
    for (const field in schema) {
      const rules = schema[field];
      const value = req.body[field];
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }
      if (value !== undefined && value !== null && value !== '') {
        if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
          errors.push(`${field} must be a valid email`);
        }
        if (rules.number && isNaN(Number(value))) {
          errors.push(`${field} must be a number`);
        }
      }
    }
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    next();
  };
}

module.exports = validate;
