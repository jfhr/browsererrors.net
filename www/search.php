<?php

/**
 * Make sure the requested error code looks legit.
 * This is important to prevent unauthorized file enumeration, open redirect, etc.
 */
function vibecheck($code) {
    // Only allow strings, PHP sometimes parses search params as arrays etc.
    if (!is_string($code)) {
        return false;
    }
    // Only allow certain characters, if any other character is found, reject the code.
    if (preg_match('[^A-Za-z0-9:_]', $code)) {
        return false;
    }
    return true;
}

function fix_error_code($code) {
    $code = trim($code);
    if (str_starts_with($code, 'ERR_')) {
        $code = 'NET::' . $code;
    }
    return $code;
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' 
    || $method === 'PUT'
    || $method === 'PATCH'
    || $method === 'DELETE'
) {
    http_response_code(405);
    header('Allow: GET,HEAD,OPTIONS');
    header('Cache-Control: max-age=604800');
    exit();
}

if ($method !== 'GET'
    && $method !== 'HEAD'
    && $method !== 'OPTIONS'
) {
    http_response_code(501);
    header('Allow: GET,HEAD,OPTIONS');
    header('Cache-Control: max-age=604800');
    exit();
}

if ($method === 'OPTIONS') {
    http_response_code(204);
    header('Allow: GET,HEAD,OPTIONS');
    header('Cache-Control: max-age=604800');
    exit();
}

$code = $_GET['code'];
if (isset($code) && vibecheck($code)) {
    $code = fix_error_code($code);
    if (file_exists("error/$code/index.html")) {
        http_response_code(308);
        header("Location: error/$code/");
        exit();
    }
}

http_response_code(404);
?>

Not found