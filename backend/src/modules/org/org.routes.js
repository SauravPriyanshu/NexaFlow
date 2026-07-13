const express = require('express');
const router = express.Router();

const {
  createOrg,
  getMyOrgs,
  getOrgById,
  updateOrg,
  deleteOrg,
  inviteMember,
  removeMember,
  updateMemberRole,
  leaveOrg,
  transferOwnership
} = require('./org.controller');

//authentication
const authenticate = require('../../shared/middleware/authenticate');
//authorization
const checkPermission = require('../../shared/middleware/checkPermission');

/**
 * @swagger
 * /orgs:
 *   post:
 *     summary: Create a new organization
 *     tags: [Organizations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: Acme Corp }
 *     responses:
 *       201:
 *         description: Organization created
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   get:
 *     summary: Get all organizations for the current user
 *     tags: [Organizations]
 *     responses:
 *       200:
 *         description: List of organizations
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /orgs/{orgId}:
 *   get:
 *     summary: Get an organization by ID
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Organization details
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     summary: Update organization settings
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               logo: { type: string }
 *     responses:
 *       200:
 *         description: Organization updated
 *   delete:
 *     summary: Delete an organization
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Organization deleted
 */

/**
 * @swagger
 * /orgs/{orgId}/invite:
 *   post:
 *     summary: Invite a user to the organization
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, role]
 *             properties:
 *               email: { type: string, format: email }
 *               role: { type: string, enum: [viewer,developer,manager,admin] }
 *     responses:
 *       200:
 *         description: User invited
 */

/**
 * @swagger
 * /orgs/{orgId}/members/{memberId}:
 *   delete:
 *     summary: Remove a member from the organization
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Member removed
 */

/**
 * @swagger
 * /orgs/{orgId}/members/{memberId}/role:
 *   patch:
 *     summary: Update a member's role
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [viewer,developer,manager,admin] }
 *     responses:
 *       200:
 *         description: Role updated
 */

// Routes that don't require specific org ID permissions
router.post('/', authenticate, createOrg);
router.get('/', authenticate, getMyOrgs);

// Routes requiring specific org ID permissions

// 'view_org' checks that the user is at least a member of the org (since all roles have view_org)
router.get('/:orgId', authenticate, checkPermission('view_org'), getOrgById);
router.patch('/:orgId', authenticate, checkPermission('manage_settings'), updateOrg);
// Owner check is internally handled in the service
router.delete('/:orgId', authenticate, deleteOrg);
router.post('/:orgId/invite', authenticate, checkPermission('invite_member'), inviteMember);
router.delete('/:orgId/members/:memberId', authenticate, checkPermission('remove_member'), removeMember);
router.patch('/:orgId/members/:memberId/role', authenticate, checkPermission('manage_settings'), updateMemberRole);

router.post('/:orgId/leave', authenticate, leaveOrg);
router.patch('/:orgId/transfer-ownership', authenticate, transferOwnership);

module.exports = router;
