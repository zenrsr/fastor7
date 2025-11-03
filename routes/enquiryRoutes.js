const { Router } = require('express');
const auth = require('../middlewares/auth');
const {
  createPublicEnquiry,
  listPublicEnquiries,
  listPrivateEnquiries,
  claimEnquiry,
} = require('../controllers/enquiryController');

const router = Router();

router.post('/public', createPublicEnquiry);
router.get('/public', auth, listPublicEnquiries);
router.get('/private', auth, listPrivateEnquiries);
router.patch('/:id/claim', auth, claimEnquiry);

module.exports = router;
