const Contact = require('../models/Contact');
const { logActivity } = require('../utils/activityLogger');

// @desc    Get all contacts
// @route   GET /api/contacts
// @access  Private
exports.getContacts = async (req, res) => {
  try {
    const { search, type, page = 1, limit = 10 } = req.query;

    // Build query
    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const contacts = await Contact.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

    res.status(200).json({
      status: 'success',
      count: contacts.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        contacts
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private
exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        contact
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create new contact
// @route   POST /api/contacts
// @access  Private
exports.createContact = async (req, res) => {
  try {
    // Add createdBy field
    req.body.createdBy = req.user.id;

    // If no assignedTo, assign to creator
    if (!req.body.assignedTo) {
      req.body.assignedTo = req.user.id;
    }

    const contact = await Contact.create(req.body);

    // Log activity
    await logActivity({
      user: req.user.id,
      action: 'CREATE',
      module: 'Contact',
      recordId: contact._id,
      recordTitle: `${contact.firstName} ${contact.lastName}`
    }, req);

    res.status(201).json({
      status: 'success',
      data: {
        contact
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
exports.updateContact = async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found'
      });
    }

    // Store old values for activity log
    const oldValues = { ...contact.toObject() };

    contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Log activity
    await logActivity({
      user: req.user.id,
      action: 'UPDATE',
      module: 'Contact',
      recordId: contact._id,
      recordTitle: `${contact.firstName} ${contact.lastName}`,
      changes: {
        before: oldValues,
        after: contact.toObject()
      }
    }, req);

    res.status(200).json({
      status: 'success',
      data: {
        contact
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found'
      });
    }

    const contactTitle = `${contact.firstName} ${contact.lastName}`;

    await contact.deleteOne();

    // Log activity
    await logActivity({
      user: req.user.id,
      action: 'DELETE',
      module: 'Contact',
      recordId: req.params.id,
      recordTitle: contactTitle
    }, req);

    res.status(200).json({
      status: 'success',
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
