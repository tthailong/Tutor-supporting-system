import Joi from "joi";

// --------------------
// TIME SLOT VALIDATION SCHEMA
// --------------------
const timeSlotSchema = Joi.object({
  dayOfWeek: Joi.string()
    .valid("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
    .required()
    .messages({
      "any.only": "dayOfWeek must be one of: Mon, Tue, Wed, Thu, Fri, Sat, Sun",
      "any.required": "dayOfWeek is required"
    }),
  startTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      "string.pattern.base": "startTime must be in HH:mm format (e.g., 09:00)",
      "any.required": "startTime is required"
    }),
  endTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .custom((value, helpers) => {
      const startTime = helpers.state.ancestors[0].startTime;
      if (startTime && value <= startTime) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "string.pattern.base": "endTime must be in HH:mm format (e.g., 11:00)",
      "any.required": "endTime is required",
      "any.invalid": "endTime must be greater than startTime"
    })
});

// --------------------
// MANUAL MATCH REQUEST VALIDATION
// --------------------
export const validateManualMatchRequest = (req, res, next) => {
  const schema = Joi.object({
    tutorId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "tutorId must be a valid MongoDB ObjectId",
        "any.required": "tutorId is required"
      }),
    subject: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        "string.empty": "subject cannot be empty",
        "any.required": "subject is required"
      }),
    description: Joi.string()
      .trim()
      .max(1000)
      .allow("")
      .optional(),
    selectedTimeSlot: Joi.object({
      date: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({
          "string.pattern.base": "date must be in YYYY-MM-DD format",
          "any.required": "date is required"
        }),
      startTime: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
          "string.pattern.base": "startTime must be in HH:mm format (e.g., 09:00)",
          "any.required": "startTime is required"
        }),
      endTime: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .custom((value, helpers) => {
          const startTime = helpers.state.ancestors[0].startTime;
          if (startTime && value <= startTime) {
            return helpers.error("any.invalid");
          }
          return value;
        })
        .messages({
          "string.pattern.base": "endTime must be in HH:mm format (e.g., 11:00)",
          "any.required": "endTime is required",
          "any.invalid": "endTime must be greater than startTime"
        })
    })
      .required()
      .messages({
        "any.required": "selectedTimeSlot is required"
      })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }
  
  next();
};

// --------------------
// AUTO MATCH REQUEST VALIDATION
// --------------------
export const validateAutoMatchRequest = (req, res, next) => {
  const schema = Joi.object({
    subject: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        "string.empty": "subject cannot be empty",
        "any.required": "subject is required"
      }),
    description: Joi.string()
      .trim()
      .max(1000)
      .allow("")
      .optional(),
    availableTimeSlots: Joi.array()
      .items(timeSlotSchema)
      .min(1)
      .required()
      .messages({
        "array.min": "At least one available time slot is required",
        "any.required": "availableTimeSlots is required"
      }),
    priorityLevel: Joi.string()
      .valid("Low", "Medium", "High")
      .optional()
      .default("Medium")
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }
  
  // Attach validated data to request
  req.validatedData = value;
  next();
};

// --------------------
// TUTOR FILTERS VALIDATION (for GET /api/tutors)
// --------------------
export const validateTutorFilters = (req, res, next) => {
  const schema = Joi.object({
    subject: Joi.string()
      .trim()
      .optional(),
    minRating: Joi.number()
      .min(0)
      .max(5)
      .optional()
      .messages({
        "number.min": "minRating must be at least 0",
        "number.max": "minRating cannot exceed 5"
      }),
    dayOfWeek: Joi.string()
      .valid("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
      .optional(),
    startTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional()
      .messages({
        "string.pattern.base": "startTime must be in HH:mm format"
      }),
    endTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional()
      .messages({
        "string.pattern.base": "endTime must be in HH:mm format"
      }),
    page: Joi.number()
      .integer()
      .min(1)
      .optional()
      .default(1),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(50)
      .optional()
      .default(10)
  });

  const { error, value } = schema.validate(req.query, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }
  
  // Attach validated query params to request
  req.validatedQuery = value;
  next();
};
