const validateUserInput = async (req, res, next) => {
  const { username, email, password, role, phone, address } = req.body;

  // Validate username
  if (!username || typeof username !== "string" || username.length < 3) {
    return res.status(400).send({
      status: "failed",
      message: "Invalid or missing username (minimum 3 characters)",
    });
  }

  // Validate email
  if (!email || typeof email !== "string" || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.status(400).send({
      status: "failed",
      message: "Invalid or missing email",
    });
  }

  // Validate password
  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).send({
      status: "failed",
      message: "Invalid or missing password (minimum 6 characters)",
    });
  }

  // Validate role
  if (!role || !['admin', 'developer', 'customer'].includes(role)) {
    return res.status(400).send({
      status: "failed",
      message: "Invalid role. Must be 'admin', 'developer', or 'customer'",
    });
  }

  // Additional validation for customers
  if (role === 'customer') {
    if (!address || typeof address !== "string" || address.trim().length < 10) {
      return res.status(400).send({
        status: "failed",
        message: "Address is required for customers (minimum 10 characters)",
      });
    }

    if (!phone || typeof phone !== "string" || phone.trim().length < 10) {
      return res.status(400).send({
        status: "failed",
        message: "Phone number is required for customers (minimum 10 characters)",
      });
    }

    // Validate phone number format (only digits)
    if (!/^\d+$/.test(phone.trim())) {
      return res.status(400).send({
        status: "failed",
        message: "Phone number must contain only numbers",
      });
    }
  }

  next();
};

module.exports = { validateUserInput };
