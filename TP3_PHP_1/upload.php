<?php
$upload_folder = 'uploads';
if (!file_exists($upload_folder)) {
    mkdir($upload_folder, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['files'])) {
        echo json_encode(["error" => "No file part"]);
        http_response_code(400);
        exit;
    }

    $files = $_FILES['files'];
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    $response = [];

    foreach ($files['name'] as $index => $filename) {
        if ($filename === '') {
            $response[] = ["error" => "Nenhum Arquivo Selecionado"];
            continue;
        }

        $file_path = $upload_folder . '/' . basename($filename);

        if (!move_uploaded_file($files['tmp_name'][$index], $file_path)) {
            $response[] = ["error" => "Falha no Upload do Arquivo"];
            continue;
        }

        $file_info = [
            "originalname" => $filename,
            "password" => !empty($password) ? password_hash($password, PASSWORD_BCRYPT) : null
        ];

        if (file_put_contents($file_path . '.json', json_encode($file_info)) === false) {
            $response[] = ["error" => "Falha ao Salvar Informações do Arquivo"];
            continue;
        }

        $response[] = ["message" => "Arquivo Enviado com Sucesso.", "filename" => $filename];
    }

    echo json_encode($response);
    http_response_code(200);
    exit;
}
?>
