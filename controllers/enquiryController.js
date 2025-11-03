const { Enquiry } = require('../models');

const PUBLIC_FIELDS = ['id', 'name', 'email', 'courseInterest', 'claimed', 'counselorId', 'createdAt'];

const createPublicEnquiry = async (req, res) => {
  const { name, email, courseInterest } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required to submit an enquiry.' });
  }

  try {
    const enquiry = await Enquiry.create({
      name,
      email,
      courseInterest: courseInterest || null,
      claimed: false,
      counselorId: null,
    });

    return res.status(201).json({
      message: 'Thanks! Someone will get back to you shortly.',
      enquiry: {
        id: enquiry.id,
        createdAt: enquiry.createdAt,
      },
    });
  } catch (error) {
    console.error('Failed to create enquiry:', error);
    return res.status(500).json({ message: 'Could not submit enquiry right now.', error: error.message });
  }
};

const listPublicEnquiries = async (_req, res) => {
  try {
    const enquiries = await Enquiry.findAll({
      where: {
        claimed: false,
      },
      order: [['createdAt', 'DESC']],
      attributes: PUBLIC_FIELDS,
    });

    return res.status(200).json({ enquiries });
  } catch (error) {
    console.error('Listing public enquiries failed:', error);
    return res.status(500).json({ message: 'Unable to fetch public enquiries.', error: error.message });
  }
};

const listPrivateEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.findAll({
      where: {
        counselorId: req.user,
      },
      order: [['updatedAt', 'DESC']],
      attributes: PUBLIC_FIELDS,
    });

    return res.status(200).json({ enquiries });
  } catch (error) {
    console.error('Listing private enquiries failed:', error);
    return res.status(500).json({ message: 'Unable to fetch private enquiries.', error: error.message });
  }
};

const claimEnquiry = async (req, res) => {
  const { id } = req.params;
  const counselorId = req.user;

  try {
    const enquiry = await Enquiry.findByPk(id);

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found.' });
    }

    if (enquiry.claimed) {
      if (enquiry.counselorId === counselorId) {
        return res.status(200).json({
          message: 'Enquiry was already claimed by you.',
          enquiry,
        });
      }

      return res.status(409).json({ message: 'This enquiry has already been claimed.' });
    }

    enquiry.claimed = true;
    enquiry.counselorId = counselorId;

    await enquiry.save();

    return res.status(200).json({
      message: 'Enquiry claimed successfully.',
      enquiry,
    });
  } catch (error) {
    console.error('Claiming enquiry failed:', error);
    return res.status(500).json({ message: 'Unable to claim enquiry.', error: error.message });
  }
};


module.exports = {
  createPublicEnquiry,
  listPublicEnquiries,
  listPrivateEnquiries,
  claimEnquiry,
};
