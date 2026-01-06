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

// // 読み取りモードで開く
// $file = fopen("../data/favorites.csv", "r");
// flock($file, LOCK_SH);

// // 連想配列化したデータを格納する変数
// $favorites = [];
// // csv構造
// // 0:userID 1:author 2:authorKana 3:isbn 4:itemCaption 5:largeImageUrl
// // 6:publisherName 7:salesDate 8:seriesName 9:title 10:titleKana 11:comment
// if ($file) {
//     while ($line = fgetcsv($file)) {
//         if ($line[0] === $userID) {
//             $favorites[] = [
//                 "author" => $line[1],
//                 "authorKana" => $line[2],
//                 "isbn" => $line[3],
//                 "itemCaption" => $line[4],
//                 "largeImageUrl" => $line[5],
//                 "publisherName" => $line[6],
//                 "salesDate" => $line[7],
//                 "seriesName" => $line[8],
//                 "title" => $line[9],
//                 "titleKana" => $line[10],
//                 "comment" => $line[11]
//             ];
//         }
//     }


//     echo json_encode($favorites, JSON_UNESCAPED_UNICODE);
// }

// flock($file, LOCK_UN);
// fclose($file);
// exit();
