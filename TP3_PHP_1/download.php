<?php
$upload_folder = 'uploads';
$data = json_decode(file_get_contents("php://input"), true);
$filename = isset($data['filename']) ? $data['filename'] : '';
$password = isset($data['password']) ? $data['password'] : '';

if (!$filename) {
    echo json_encode(["error" => "Filename is required"]);
    http_response_code(400);
    exit;
}

$json_file_path = $upload_folder . '/' . $filename . '.json';
$file_path = $upload_folder . '/' . $filename;

if (!file_exists($json_file_path)) {
    echo json_encode(["error" => "File not found"]);
    http_response_code(404);
    exit;
}

$file_info = json_decode(file_get_contents($json_file_path), true);
if (!empty($file_info["password"])) {
    if (!$password || !password_verify($password, $file_info["password"])) {
        echo json_encode(["error" => "Senha Inválida"]);
        http_response_code(403);
        exit;
    }
}

if (file_exists($file_path)) {
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename=' . basename($file_path));
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($file_path));
    readfile($file_path);
    exit;
} else {
    echo json_encode(["error" => "File not found"]);
    http_response_code(404);
    exit;
}
?>