<?php
/**
 * Mini Router for Intranet CAS API
 */

$ROUTES = [];

function route($method, $pathPattern, $handler)
{
    global $ROUTES;
    $ROUTES[] = [
        'method' => strtoupper($method),
        'pattern' => $pathPattern,
        'handler' => $handler
    ];
}

function dispatch($currentMethod, $currentRoute)
{
    global $ROUTES;

    foreach ($ROUTES as $r) {
        if ($r['method'] !== 'ANY' && $r['method'] !== strtoupper($currentMethod)) {
            continue;
        }

        // Convert simple patterns to regex
        // e.g. "users/:id" -> "/^users\/([a-zA-Z0-9_\-]+)$/"
        $pattern = preg_replace('/\/:([a-zA-Z0-9_]+)/', '/([a-zA-Z0-9_\-\.]+)', $r['pattern']);
        $regex = '/^' . str_replace('/', '\/', $pattern) . '$/';

        if (preg_match($regex, $currentRoute, $matches)) {
            array_shift($matches); // Remove full match
            return call_user_func_array($r['handler'], $matches);
        }
    }

    out(['error' => 'Route not found', 'route' => $currentRoute], 404);
}
