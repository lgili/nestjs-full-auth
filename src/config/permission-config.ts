interface PermissionConfigInterface {
  roles: Array<rolePayload>;
  defaultRoutes?: Array<RoutePayloadInterface>;
  modules: Array<ModulesPayloadInterface>;
}

interface rolePayload {
  id: number;
  name: string;
  description: string;
}

export enum MethodList {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  ANY = 'any',
  OPTIONS = 'options',
}

export interface RoutePayloadInterface {
  path: string;
  method: MethodList;
  resource?: string;
  description?: string;
  isDefault?: boolean;
}

export interface ModulesPayloadInterface {
  name: string;
  resource: string;
  hasSubmodules: boolean;
  route?: string;
  submodules?: Array<SubModulePayloadInterface>;
  permissions?: Array<PermissionPayload>;
}

export interface SubModulePayloadInterface {
  name: string;
  resource?: string;
  route?: string;
  permissions?: Array<PermissionPayload>;
}

export interface PermissionPayload {
  name: string;
  resource?: string;
  route: Array<RoutePayloadInterface>;
}

export const PermissionConfiguration: PermissionConfigInterface = {
  roles: [
    {
      id: 1,
      name: 'superuser',
      description: 'superuser of the system',
    },
    {
      id: 2,
      name: 'normal',
      description: 'normal user of the system',
    },
  ],
  defaultRoutes: [
    {
      path: '/api/v1/check',
      method: MethodList.GET,
    },
    {
      path: '/api/v1/auth/register',
      method: MethodList.POST,
    },
    {
      path: '/api/v1/auth/login',
      method: MethodList.POST,
    },
    {
      path: '/api/v1/auth/profile',
      method: MethodList.GET,
    },
    {
      path: '/api/v1/auth/activate-account',
      method: MethodList.GET,
    },
    {
      path: '/api/v1/auth/forgot-password',
      method: MethodList.PUT,
    },
    {
      path: '/api/v1/auth/reset-password',
      method: MethodList.PUT,
    },
    {
      path: '/api/v1/auth/change-password',
      method: MethodList.PUT,
    },
    {
      path: '/api/v1/auth/profile',
      method: MethodList.PUT,
    },
    {
      path: '/api/v1/revoke/:id',
      method: MethodList.PUT,
    },
    {
      path: '/api/v1/auth/token-info',
      method: MethodList.GET,
    },
    {
      path: '/api/v1/dashboard/users',
      method: MethodList.GET,
    },
    {
      path: '/api/v1/dashboard/os',
      method: MethodList.GET,
    },
    {
      path: '/api/v1/dashboard/browser',
      method: MethodList.GET,
    },
    {
      path: '/api/v1/logout',
      method: MethodList.POST,
    },
  ],
  modules: [
    {
      name: 'User management',
      resource: 'user',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all user',
          route: [
            {
              path: '/api/v1/users',
              method: MethodList.GET,
            },
          ],
        },
        {
          name: 'Store new user',
          route: [
            {
              path: '/api/v1/users',
              method: MethodList.POST,
            },
          ],
        },
        {
          name: 'Update user by id',
          route: [
            {
              path: '/api/v1/users/:id',
              method: MethodList.PUT,
            },
          ],
        },
        {
          name: 'Get user by id',
          route: [
            {
              path: '/api/v1/users/:id',
              method: MethodList.GET,
            },
          ],
        },
      ],
    },
    {
      name: 'Role management',
      resource: 'role',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all role',
          route: [
            {
              path: '/api/v1/roles',
              method: MethodList.GET,
            },
          ],
        },
        {
          name: 'View role by id',
          route: [
            {
              path: '/api/v1/roles/:id',
              method: MethodList.GET,
            },
          ],
        },
        {
          name: 'Store new role',
          route: [
            {
              path: '/api/v1/roles',
              method: MethodList.POST,
            },
          ],
        },
        {
          name: 'Update role by id',
          route: [
            {
              path: '/api/v1/roles/:id',
              method: MethodList.PUT,
            },
          ],
        },
        {
          name: 'Delete role by id',
          route: [
            {
              path: '/api/v1/roles/:id',
              method: MethodList.DELETE,
            },
          ],
        },
      ],
    },
    {
      name: 'Permission management',
      resource: 'permission',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all permission',
          route: [
            {
              path: '/api/v1/permissions',
              method: MethodList.GET,
            },
          ],
        },
        {
          name: 'Sync permission from config',
          route: [
            {
              path: '/api/v1/permissions/sync',
              method: MethodList.POST,
            },
          ],
        },
        {
          name: 'View permission by id',
          route: [
            {
              path: '/api/v1/permissions/:id',
              method: MethodList.GET,
            },
          ],
        },
        {
          name: 'Store new permission',
          route: [
            {
              path: '/api/v1/permissions',
              method: MethodList.POST,
            },
          ],
        },
        {
          name: 'Update permission by id',
          route: [
            {
              path: '/api/v1/permissions/:id',
              method: MethodList.PUT,
            },
          ],
        },
        {
          name: 'Delete permission by id',
          route: [
            {
              path: '/api/v1/permissions/:id',
              method: MethodList.DELETE,
            },
          ],
        },
      ],
    },
    {
      name: 'Email Templates',
      resource: 'emailTemplates',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all email templates',
          route: [
            {
              path: '/api/v1/email-templates',
              method: MethodList.GET,
            },
          ],
        },
        {
          name: 'View email templates by id',
          route: [
            {
              path: '/api/v1/email-templates/:id',
              method: MethodList.GET,
            },
          ],
        },
        {
          name: 'Store new email templates',
          route: [
            {
              path: '/api/v1/email-templates',
              method: MethodList.POST,
            },
          ],
        },
        {
          name: 'Update email templates by id',
          route: [
            {
              path: '/api/v1/email-templates/:id',
              method: MethodList.PUT,
            },
          ],
        },
        {
          name: 'Delete email templates by id',
          route: [
            {
              path: '/api/v1/email-templates/:id',
              method: MethodList.DELETE,
            },
          ],
        },
      ],
    },
  ],
};
