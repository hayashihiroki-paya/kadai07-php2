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


// $file = fopen("../data/users.csv", "r");
// flock($file, LOCK_SH);

// if ($file) {

//     while ($users = fgetcsv($file)) {

//         // var_dump($line);

//         if ($users[0] === $_POST["userID"]) {
//             // echo "データベース：" . $users[0] . "POSTデータ" . $_POST["userID"] . "で一致しました";
//             // 一致してたらセッションに保存
//             $_SESSION["userID"] = $users[0];
//             $_SESSION["userName"] = trim($users[1]);

//             // ファイルを閉じて返す
//             flock($file, LOCK_UN);
//             fclose($file);

//             header("Location: ../index.php");
//             exit();
//         } else {
//             // echo "データベース：" . $users[0] . "POSTデータ" . $_POST["userID"] . "で不一致";
//         }


//     }
// }

// // 念のため 後々登録がなかった時の処理を作ったときに適切な位置に動かします
// flock($file, LOCK_UN);
// fclose($file);

exit();
