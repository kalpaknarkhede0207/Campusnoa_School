// Multi-Institution Tenant Isolation Guard
export const enforceTenantScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  }

  // Super Admin can optionally specify target institution via X-Institution-Id header
  if (req.user.roleCode === 'SUPER_ADMIN') {
    req.institutionId = req.headers['x-institution-id'] || req.user.institutionId;
    return next();
  }

  // For all other roles, institutionId is strictly locked to user's assigned institution
  req.institutionId = req.user.institutionId;

  // Check if request payload or query explicitly tries to target a different institution
  const requestedTenant = req.body?.institutionId || req.query?.institutionId || req.params?.institutionId;
  if (requestedTenant && requestedTenant !== req.user.institutionId) {
    return res.status(403).json({
      success: false,
      error: 'CROSS_TENANT_VIOLATION',
      message: 'Access Denied: Cross-institution data access is strictly prohibited by security policy.'
    });
  }

  next();
};
