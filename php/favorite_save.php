<?php
// 文字列を受け取って改行文字などをスペースに置き換える関数
function sanitizeForCsv($str)
{
  return str_replace(["\r\n", "\r", "\n"], " ", $str);
}

session_start();
// echo "お気に入り登録ページに移動できました";
// $_POST["bookData"]ない、またはログイン情報ない時終了
if (!isset($_POST["bookData"]) || !isset($_SESSION["userID"])) {
  exit();
}

// 受け取ったデータ格納
$bookData = $_POST["bookData"];
// echo $bookData["itemCaption"];
$bookData["itemCaption"] = sanitizeForCsv($bookData["itemCaption"]);
// echo $bookData["itemCaption"];
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

// 「dbError:...」が表示されたらdb接続でエラーが発生していることがわかる．

// 重複チェック
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
foreach ($result as $record) {
  if ($record["userID"] === $userID && $record["isbn"] === $bookData["isbn"]) {
    // userID と isbn が重複しているので保存処理をカット
    echo "重複を検知したので保存せずに戻します";
    // indexに戻す
    // header("Location: ../index.php");
    exit();
  }
}


// SQL作成&実行
$sql = 'INSERT INTO favorites_table (id, userID, author, authorKana, isbn, itemCaption, largeImageUrl, publisherName, salesDate, seriesName, title, titleKana, comment, created_at, updated_at) VALUES (NULL, :userID, :author, :authorKana, :isbn, :itemCaption, :largeImageUrl, :publisherName, :salesDate, :seriesName, :title, :titleKana, :comment, now(), now())';

$stmt = $pdo->prepare($sql);

// バインド変数を設定
$stmt->bindValue(':userID', $userID, PDO::PARAM_STR);
$stmt->bindValue(':author', $bookData["author"], PDO::PARAM_STR);
$stmt->bindValue(':authorKana', $bookData["authorKana"], PDO::PARAM_STR);
$stmt->bindValue(':isbn', $bookData["isbn"], PDO::PARAM_STR);
$stmt->bindValue(':itemCaption', $bookData["itemCaption"], PDO::PARAM_STR);
$stmt->bindValue(':largeImageUrl', $bookData["largeImageUrl"], PDO::PARAM_STR);
$stmt->bindValue(':publisherName', $bookData["publisherName"], PDO::PARAM_STR);
$stmt->bindValue(':salesDate', $bookData["salesDate"], PDO::PARAM_STR);
$stmt->bindValue(':seriesName', $bookData["seriesName"], PDO::PARAM_STR);
$stmt->bindValue(':title', $bookData["title"], PDO::PARAM_STR);
$stmt->bindValue(':titleKana', $bookData["titleKana"], PDO::PARAM_STR);
$stmt->bindValue(':comment', $bookData["comment"], PDO::PARAM_STR);

// SQL実行（実行に失敗すると `sql error ...` が出力される）
try {
  $status = $stmt->execute();
} catch (PDOException $e) {
  echo json_encode(["sql error" => "{$e->getMessage()}"]);
  exit();
}

// // 読み取りモードで開く
// $file = fopen("../data/favorites.csv", "r");
// flock($file, LOCK_SH);

// if ($file) {
//     // fgetcsv($file)で配列にして 0番ユーザーID 3番isbn
//     // csv構造
//     // 0:userID 1:author 2:authorKana 3:isbn 4:itemCaption 5:largeImageUrl
//     // 6:publisherName 7:salesDate 8:seriesName 9:title 10:titleKana 11:comment
//     while ($line = fgetcsv($file)) {
//         if ($line[0] === $userID && $line[3] === $bookData["isbn"]) {
//             // echo "重複検知！！" . $line[0] . $userID . $line[3] . $bookData["isbn"];
//             var_dump($line[11]);
//             var_dump($bookData["comment"]);
//             flock($file, LOCK_UN);
//             fclose($file);
//             exit();
//         }

//     }
// }

// // 以下、重複ない時の処理
// // いったんファイル閉じる
// flock($file, LOCK_UN);
// fclose($file);


// // 掻き込みモードで開く
// $file = fopen("../data/favorites.csv", "a");
// flock($file, LOCK_EX);
// fwrite($file, $userID . ",");
// fputcsv($file, $bookData);
// flock($file, LOCK_UN);
// fclose($file);
// exit();