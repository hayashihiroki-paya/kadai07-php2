<?php
session_start();

if (!isset($_POST["userID"]) || $_POST["userID"] === "") {
    exit("userIDがありません");
}

$userID = $_POST["userID"];

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
$sql = 'SELECT * FROM users_table';
$stmt = $pdo->prepare($sql);

try {
    $status = $stmt->execute();
} catch (PDOException $e) {
    echo json_encode(["sql error" => "{$e->getMessage()}"]);
    exit();
}

// SQL実行の処理
$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($result as $record) {
    if ($record["userID"] === $userID) {
        // 登録されているかを知らべ、見つけたときセッションに保存
        $_SESSION["userID"] = $record["userID"];
        $_SESSION["userName"] = trim($record["userName"]);
        // indexに戻す
        header("Location: ../index.php");
        exit();
    }
}
exit();