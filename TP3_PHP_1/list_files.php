<?php
$upload_folder = 'uploads';
$files = [];
if ($handle = opendir($upload_folder)) {
    while (false !== ($entry = readdir($handle))) {
        if ($entry != "." && $entry != ".." && pathinfo($entry, PATHINFO_EXTENSION) == 'json') {
            $file_info = json_decode(file_get_contents($upload_folder . '/' . $entry), true);
            $files[] = [
                "originalname" => $file_info["originalname"],
                "filename" => basename($entry, '.json'),
                "hasPassword" => !empty($file_info["password"])
            ];
        }
    }
    closedir($handle);
}
echo json_encode($files);
http_response_code(200);
exit;
?>
