<?php

session_start();
// echo "お気に入りデータ取得ページに移動できました";
// ログイン情報ない時終了
if (!isset($_SESSION["userID"]) || $_SESSION["userID"] === "") {
    // echo "ログイン情報がありません";
    exit();
}

$userID = $_SESSION["userID"];

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
$sql = 'SELECT * FROM favorites_table';
$stmt = $pdo->prepare($sql);

try {
    $status = $stmt->execute();
} catch (PDOException $e) {
    echo json_encode(["sql error" => "{$e->getMessage()}"]);
    exit();
}

// SQL実行の処理
$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
$favorites = [];
foreach ($result as $record) {
    if ($record["userID"] === $userID) {
        // userID が一致しているので配列に保存
        $favorites[] = [
            "author" => $record["author"],
            "authorKana" => $record["authorKana"],
            "isbn" => $record["isbn"],
            "itemCaption" => $record["itemCaption"],
            "largeImageUrl" => $record["largeImageUrl"],
            "publisherName" => $record["publisherName"],
            "salesDate" => $record["salesDate"],
            "seriesName" => $record["seriesName"],
            "title" => $record["title"],
            "titleKana" => $record["titleKana"],
            "comment" => $record["comment"]
        ];
    }
}

echo json_encode($favorites, JSON_UNESCAPED_UNICODE);
