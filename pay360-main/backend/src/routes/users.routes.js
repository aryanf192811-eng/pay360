'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/users.controller');
const { authenticate, authorize } = require('../middleware/auth');

// PS §3 Admin: "User management, role assignment, permission updates" — admin-only, no exceptions.
router.use(authenticate, authorize('admin'));

router.get('/', ctrl.list);
router.patch('/:id', ctrl.update);

module.exports = router;
