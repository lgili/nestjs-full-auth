/*
  Warnings:

  - The primary key for the `PermissionsOnRoles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `PermissionsOnRoles` table. All the data in the column will be lost.
  - Made the column `permissionId` on table `PermissionsOnRoles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `roleId` on table `PermissionsOnRoles` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PermissionsOnRoles" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("roleId", "permissionId"),
    CONSTRAINT "PermissionsOnRoles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PermissionsOnRoles_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PermissionsOnRoles" ("assignedAt", "permissionId", "roleId") SELECT "assignedAt", "permissionId", "roleId" FROM "PermissionsOnRoles";
DROP TABLE "PermissionsOnRoles";
ALTER TABLE "new_PermissionsOnRoles" RENAME TO "PermissionsOnRoles";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
