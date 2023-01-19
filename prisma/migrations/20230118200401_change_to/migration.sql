-- CreateTable
CREATE TABLE "PermissionsOnRoles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roleId" TEXT,
    "permissionId" TEXT,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PermissionsOnRoles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PermissionsOnRoles_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
