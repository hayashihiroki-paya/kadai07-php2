<?php

session_start();
// echo "お気に入りデータ取得ページに移動できました";
// ログイン情報ない時終了
if (!isset($_SESSION["userID"]) || $_SESSION["userID"] === "") {
    exit();
}

$userID = $_SESSION["userID"];
$isbn = $_POST["isbn"];

// 各種項目設定
$dbn = 'mysql:dbname=ranobe_db;charset=utf8mb4;port=3306;host=localhost';
$user = 'root';
$pwd = '';

// DB接続
try {
    $pdo = new PDO($dbn, $user, $pwd);
} catch (PDOException $e) {
    echo json_encode(["db error" => "{$e->getMessage()}"]);
    exit();
}

// SQL接続
$sql = 'SELECT * FROM good_point_table';
$stmt = $pdo->prepare($sql);

try {
    $status = $stmt->execute();
} catch (PDOException $e) {
    echo json_encode(["sql error" => "{$e->getMessage()}"]);
    exit();
}

// SQL実行の処理
$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
$goodPoints = [];
foreach ($result as $record) {
    if ($record["userID"] === $userID && $record["isbn"] === $isbn) {
        // userID が一致しているので配列に保存
        $goodPoints[] = [
            "category" => $record["category"],
            "goodPoint" => $record["goodPoint"]
        ];
    }
}

echo json_encode($goodPoints, JSON_UNESCAPED_UNICODE);

// // 読み取りモードで開く
// $file = fopen("../data/good_points.csv", "r");
// flock($file, LOCK_SH);

// // 連想配列化したデータを格納する変数
// $goodPoints = [];

// // $line => 0:userID,1:isbn,2:title,3:category,4:goodPoint
// if ($file) {
//     while ($line = fgetcsv($file)) {
//         if ($line[0] === $userID && $line[1] === $isbn) {
//             $goodPoints[] = [
//                 "category" => $line[3],
//                 "goodPoint" => $line[4]
//             ];
//         }
//     }
//     echo json_encode($goodPoints, JSON_UNESCAPED_UNICODE);
// }

// flock($file, LOCK_UN);
// fclose($file);
// exit();
