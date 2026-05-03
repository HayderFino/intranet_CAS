<?php
/**
 * Auth Module
 */

route('POST', 'auth/login', function() {
    $in = body();
    $users = read_json(DATA_ROOT . 'default_user.json');
    foreach ($users as $u) {
        if ($u['username'] === ($in['username'] ?? '') && password_verify($in['password'] ?? '', $u['password'])) {
            $_SESSION['userId'] = $u['id'] ?? $u['_id'] ?? uniqid();
            $_SESSION['displayName'] = $u['displayName'];
            $_SESSION['role'] = $u['role'];
            $_SESSION['permissions'] = $u['permissions'];
            out([
                'success' => true,
                'user' => [
                    'username' => $u['username'],
                    'displayName' => $u['displayName'],
                    'role' => $u['role'],
                    'permissions' => $u['permissions'],
                ]
            ]);
        }
    }
    out(['success' => false, 'message' => 'Credenciales inválidas'], 401);
});

route('ANY', 'auth/logout', function() {
    session_destroy();
    out(['success' => true]);
});

route('GET', 'auth/check', function() {
    if (isset($_SESSION['userId'])) {
        out([
            'success' => true,
            'user' => [
                'displayName' => $_SESSION['displayName'],
                'role' => $_SESSION['role'],
                'permissions' => $_SESSION['permissions'],
            ]
        ]);
    }
    out(['success' => false], 401);
});
