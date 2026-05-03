<?php
/**
 * Authentication logic for Intranet CAS API
 */

function auth($resource = null)
{
    if (!isset($_SESSION['userId']))
        out(['message' => 'No autorizado'], 401);

    $role = $_SESSION['role'] ?? '';
    $permissions = $_SESSION['permissions'] ?? [];

    // Si es superadmin, tiene acceso a todo
    if ($role === 'superadmin')
        return;

    // Si se requiere acceso de superadmin (como para gestionar usuarios)
    if ($resource === 'users' || $resource === true) {
        if ($role !== 'superadmin' && !($permissions['users'] ?? false)) {
            out(['message' => 'Requiere Super Admin o permiso de Usuarios. Tu rol: ' . $role], 403);
        }
        return;
    }

    // Para otros recursos, si se pasó un nombre de recurso, verificar permiso
    if ($resource && !($permissions[$resource] ?? false)) {
        out(['message' => 'No tienes permiso para: ' . $resource], 403);
    }
}
