const validateResource = (schema) => async (req, res, next) => {
  const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  };
  try {
    await schema.validateAsync(
      {
        body: req.body,
        query: req.query,
        params: req.params,
      },
      options
    );
    next();
  } catch (e) {
    return res.status(400).jsonp(e.details);
  }
};

// module.exports = validateResource;
export default validateResource;
