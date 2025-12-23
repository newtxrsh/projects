<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    // Allow Nuxt frontend during development
    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        '*', // Keep for flexibility, remove in production
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];


