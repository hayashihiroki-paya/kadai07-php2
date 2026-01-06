// =====================================
// ページ読み込み時の処理
// =====================================

// ページ更新時に保存したデータの一覧表示を行い、取得したデータを保存する
// 保存するための空の配列
let favoriteBookList = [];
// 保存したデータをとってきて上の配列に入れつつ表示まで行う
loadBookList();

// ボタンの見た目をjQuery UI で設定
$(".button").button();


// =====================================
// 検索ボタンがクリックされたとき
// =====================================

// データ格納用の空配列
let selectionData = [];
$("#searchButton").on('click', async function () {
    // await処理中にボタンの表示を変える
    $("#searchButton").text("検索中・・・");
    // selectionData初期化
    selectionData.splice(0, selectionData.length);
    // console.log("searchButtonクリックされました");
    const queryText = $("#searchWord").val();
    // 検索ワードをAPIに投げる 今回は楽天のアプリケーションIDが必要だった
    // Vercelを使ってキーを秘匿します
    await axios.get("https://kadai05-api-kohl.vercel.app/api/rakuten", {
        params: { title: queryText, booksGenreId: "001017" }
    }).then(res => {
        // console.log(res.data.Items);
        const originalData = res.data.Items;

        // 検索結果の配列を渡すと、必要な情報だけ引っこ抜いた配列を返してくれる関数
        selectionData = sortData(originalData);
        // console.log("selectionData一回目", selectionData);


    });

    // ジャンル指定がもう一つしないと抜けが多かったので追加
    await axios.get("https://kadai05-api-kohl.vercel.app/api/rakuten", {
        params: { title: queryText, booksGenreId: "001004008" }
    }).then(res => {
        // console.log(res.data.Items);
        const originalData = res.data.Items;

        // 検索結果から必要なデータを抜いて、前の条件で検索したものに統合する
        selectionData = selectionData.concat(sortData(originalData));
        // console.log("selectionData二回目", selectionData);

        // 検索終わったので元に戻す
        $("#searchButton").text("検索");

        // 配列を渡して中身を描画してくれる関数
        viewData(selectionData);
    });

})



// =====================================
// お気に入りゾーンにドロップされたときの処理（データ保存する）
// =====================================

$("#favorite").droppable({
    drop: async function (e, ui) {

        // ドラッグしてきた要素の情報を格納
        const $original = ui.draggable;
        // 何番目の要素かを取得
        const index = $(".viewBlock").index($original);
        // 確認
        // console.log("何番目のviewBlockか:", index);
        // console.log("対応する検索結果情報:", selectionData[index]);

        // favorite_save.php に情報を送って保存
        await $.post("php/favorite_save.php", {
            bookData: selectionData[index]
        }, function (res) {
            console.log("res", res);
            loadBookList();
        });

        // console.log("保存処理終了");

    }
});



// =====================================
// お気に入り削除ボタンクリック時の処理（データ削除）
// =====================================
$(document).on("click", ".deleteBtn", function () {
    // console.log("削除ボタンクリックされました");

    // deleteBtnに持たせていたisbnの情報を取得（FirebaseのIDになる）
    const isbn = $(this).data("isbn");

    // 削除は特に誤操作したくないと思うのでポップアップ出します
    if (!confirm("削除しますか？")) return;

    // delete.js経由してVercel使って、API秘匿しながらデータベース削除
    axios.delete("https://kadai05-api-kohl.vercel.app/api/delete", {
        params: { isbn }
    })
        .then(() => {
            alert("削除しました");
            $("#detailedInformation").html(""); // 詳細画面クリア
            $("#detailedInformation").css('display', 'none'); // 画面も消す
            loadBookList(); // 再読み込み
        })
        .catch(err => {
            console.error(err);
        });
});



// =====================================
// 保存済みデータクリック時の処理（詳細情報、コメント記入欄表示）
// =====================================
$(document).on("click", ".book", async function () {

    // console.log("保存済みデータクリックされました");
    // 保存リスト何番目か取得
    const index = $(".book").index(this);
    // console.log("何番目か：", index);
    // 親要素の横幅に合わせて表示するために現在の幅を取得
    const parentWidth = $("#view").width();
    // console.log("parentWidth", parentWidth);

    // 詳細情報画面を表示する
    $("#detailedInformation").css('display', 'block');
    $("#detailedInformation").css('width', parentWidth);
    $("#detailedInformation").css('z-index', '100');

    // htmlの中身を作成する
    let html =
        `<div>
            <p>${favoriteBookList[index].title}</p>
            <div><img src="${favoriteBookList[index].largeImageUrl}" alt="${favoriteBookList[index].title}の表紙"></div>
            <p>${favoriteBookList[index].author}</p>
            <p>${favoriteBookList[index].itemCaption}</p>
            <p>${favoriteBookList[index].publisherName}</p>
            <p>${favoriteBookList[index].salesDate}</p>
            <p>${favoriteBookList[index].seriesName}</p>
        </div>
        <div>
            <p id="comment">`;
    // console.log("favoriteBookList[index].comment", favoriteBookList[index].comment);
    // commentの情報があるときは表示する
    if (favoriteBookList[index].comment) {
        html += favoriteBookList[index].comment;
    }
    html +=
        `</p>
            <div><input id="commentText" type="textarea" class="textInput"></div>
            <div>
                <button class="commentBtn button" data-index=${index}>コメントする</button>
                <button class="commentDeleteBtn button" data-index=${index}>コメント削除</button>
                <button class="deleteBtn button" data-isbn="${favoriteBookList[index].isbn}">お気に入りから削除</button>
                <button class="closeBtn button">詳細画面を閉じる</button>
            </div>
            <div id="goodPoint">
                <button class="inputButton button">ココ好き！ を入力する</button>
                <button class="statisticsButton button" data-isbn="${favoriteBookList[index].isbn}">みんなの ココ好き！ を見る</button>
                <div id="categoryBox"></div>
                <div id="goodPointElements"></div>
                <button class="saveButton button" data-isbn="${favoriteBookList[index].isbn}" data-title="${favoriteBookList[index].title}">保存する</button>
                <div id="goodPointView">
                    <div id="registeredView" ></div>
                    <div id="statisticsView" ></div>
                </div>  
            </div>
        </div>
        `;

    // 詳細画面にhtmlを反映する
    $("#detailedInformation").html(html);
    $(".saveButton").css("display", "none");

    // 登録済みココ好きポイントをregisteredViewに表示する
    // isbnを送ってカテゴリ名と詳細項目を配列で返してもらう
    // 関数化します
    goodPointRead(favoriteBookList[index].isbn);

    // 作成したボタンをUIデザインに変更する
    $(".button").button();
});



// =====================================
// ココ好きポイント 入力操作（入力項目がボタンの選択肢で表示される 親項目からネストで子項目が出てくる）
// =====================================
// 入力内容を保存する（複数選択できるように配列）
const goodPointInput = [];
// カテゴリ表示
$(document).on("click", ".inputButton", function () {
    $("#categoryBox").html(""); // いったんリセットする
    $("#goodPointElements").html(""); // いったんリセットする
    $(".inputButton").text("ココ好きポイント 入力中・・・"); // ボタンの表示変更
    $(".inputButton").addClass("selected"); // 選択中表示色変え
    goodPointInput.splice(0, goodPointInput.length); // 初動操作なので保持データリセット

    // categoryのリスト（後から増やしても動くように作る）
    const categoryList = ["ジャンル", "主人公", "設定"];

    // 入力用のボタンを作る data属性にカテゴリ名保持
    let html = "";
    for (let i = 0; i < categoryList.length; i++) {
        html += `<button class='categoryButton button' data-category=${categoryList[i]}>${categoryList[i]}</button>`
    }

    // htmlを反映してボタン追加
    $("#categoryBox").html(html);

    // 作成したボタンをUIデザインに変更する
    $(".button").button();
});

// 詳細項目表示
$(document).on("click", ".categoryButton", function () {
    $(".categoryButton").each(function () {
        $(this).removeClass("selected");
    });
    $(this).addClass("selected");
    const category = $(this).data('category');
    const text = $(this).text();
    // console.log("category + text :", category + " + " + text);
    // categoryの文字列に応じて小項目ボタンを生成する関数
    generateGoodPointButton(category);

});

// 詳細項目選択 goodPointButton
$(document).on("click", ".goodPointButton", function () {

    const category = $(this).data('category');
    const text = $(this).text();
    // console.log("category + text :", category + " + " + text);

    // 重複してたら取り消す
    const flag = {
        add: true, // 追加フラグ
        removeNumber: -1 // 削除するときの配列番号 初期値は存在しない数値にしとく
    }
    for (let i = 0; i < goodPointInput.length; i++) {
        // console.log(goodPointInput[i]);
        if (goodPointInput[i][0] === category && goodPointInput[i][1] === text) {
            // リストにあるものがもう一度押されたので削除する
            flag.add = false; // 追加をオフで削除処理
            flag.removeNumber = i; // 削除する配列番号を格納
            break;
        }
    }

    // 重複してなければリストに追加
    if (flag.add) {
        // ココ好きポイントの追加リストに追加
        goodPointInput.push([category, text]);
        // ボタンの文字に色を付ける
        $(this).addClass("selected");
    } else {
        // リストから削除
        goodPointInput.splice(flag.removeNumber, 1);
        // ボタンの文字も戻す
        $(this).removeClass("selected");
    }
    // console.log("goodPointInput:", goodPointInput);

    // リストの情報があるとき保存ボタンを表示
    if (goodPointInput.length > 0) {
        $(".saveButton").css("display", "block");
    } else {
        $(".saveButton").css("display", "none");
    }

});

// saveButton操作
$(document).on("click", ".saveButton", async function () {
    // 書籍データを取得
    const isbn = $(this).data("isbn");
    const title = $(this).data("title");

    // 保存処理に送る
    await $.post("php/good_point_save.php", {
        isbn: isbn,
        title: title,
        goodPoint: goodPointInput
    }, function (res) {
        console.log("res", res);
        // 保存完了したので保存リストリセット
        goodPointInput.splice(0, goodPointInput.length);

        // 登録済みここ好きポイントを更新して表示する
        goodPointRead(isbn);

        // buttonの色変えを戻す
        $(".button").removeClass("selected");

        // 小項目を消す
        $("#categoryBox").html("");
        $("#goodPointElements").html("");
        $(".saveButton").css("display", "none");

        $(".inputButton").text("ココ好きポイント を入力する"); // ボタンの表示変更
    });
});



// =====================================
// ココ好き統計ボタン
// =====================================
$(document).on("click", ".statisticsButton", async function () {
    $("#statisticsView").css("display", "block");
    $("#registeredView").css("width", "50%");
    $("#statisticsView").css("width", "50%");
    const isbn = $(this).data("isbn");
    // good_points_tableからuserIDごとの情報をまとめて取得する
    await $.post("php/book_data_read.php", {
        isbn: isbn
    }, function (res) {
        const bookData = JSON.parse(res);

        // 項目ごとに多い順に並び替えして、件数も付与した配列を返す関数
        const sortData = dataSort(bookData);

        // countが大きい順に並んだので表示していく
        let html = "<p>みんなの好みの傾向は・・・</p>";

        for (let i = 0; i < sortData.length; i++) {
            html += `
            <p>${i + 1}位：${sortData[i].category} が ${sortData[i].goodPoint} </p>`;
        };

        // タグを埋め込む
        $("#statisticsView").html(html);

        // 作成したボタンをUIデザインに変更する
        $(".button").button();

    });
});

// =====================================
// コメントボタンクリック時の処理（データ追加）
// =====================================
$(document).on("click", ".commentBtn", async function () {

    // firebaseから切り替え予定

    console.log("コメントボタンクリックされました");

    // // 保存中にボタンの表示を変更する
    // $(".commentBtn").text("保存中・・・");

    // // インデックス番号取得
    // const index = $(this).data("index");
    // console.log("index", index);

    // // オブジェクトデータのコメントを入力内容で更新する
    // favoriteBookList[index].comment = $('#commentText').val();
    // console.log(favoriteBookList[index].comment); // ちゃんと入ってるの確認しました

    // データ更新
    // save.js経由でVercelを使って、APIキーを秘匿しながら保存処理
    // await axios.post("https://kadai05-api-kohl.vercel.app/api/save",
    //     favoriteBookList[index],
    //     {
    //         headers: {
    //             "Content-Type": "application/json"
    //         }
    //     })
    //     .then(() => {
    //         alert("保存しました！");
    //         $("#comment").text(favoriteBookList[index].comment); // コメント欄に表示
    //         $('#commentText').val(""); // 入力欄クリア
    //         $(".commentBtn").text("コメントする"); // 保存終わったのでボタンの表示を戻す
    //         loadBookList(); // 保存リスト更新
    //     }).catch(err => {
    //         console.error(err);
    //     });
});



// =====================================
// コメント削除クリック時の処理（commentデータを空文字で上書き）
// =====================================
$(document).on("click", ".commentDeleteBtn", async function () {

    // firebase保存から切り替え予定

    // // console.log("コメント削除クリックされました");

    // // 削除中にボタンの表示を変更
    // $(".commentDeleteBtn").text("削除中・・・");

    // // インデックス番号取得
    // const index = $(this).data("index");
    // // console.log("index", index);
    // favoriteBookList[index].comment = ""; // 空文字で上書き
    // // console.log(favoriteBookList[index].comment); // ちゃんと消えてるの確認しました    

    // // データ更新
    // // save.js経由でVercelを使って、APIキーを秘匿しながら保存処理
    // await axios.post("https://kadai05-api-kohl.vercel.app/api/save",
    //     favoriteBookList[index],
    //     {
    //         headers: {
    //             "Content-Type": "application/json"
    //         }
    //     })
    //     .then(() => {
    //         alert("削除しました！");
    //         $("#comment").text(""); // コメント欄もクリア
    //         $(".commentDeleteBtn").text("コメント削除"); // 削除終了でボタンの表示を戻す
    //         loadBookList(); // 保存リスト更新
    //     }).catch(err => {
    //         console.error(err);
    //     });
});


// =====================================
// 閉じるボタンクリック時の処理（詳細画面クリアして閉じる）
// =====================================
$(document).on("click", ".closeBtn", async function () {
    $("#detailedInformation").html("");
    $("#detailedInformation").css('display', 'none');
});


// =====================================
// ユーザー詳細情報表示
// =====================================
$(".userDataButton").on("click", async function () {
    // sessionデータからuserID取得して、IDごとの統計情報を返す
    // array = [{category: "世界観", goodPoint: "ファンタジー"},{...}]みたいな
    // good_points_tableからuserIDごとの情報をまとめて取得する
    await $.post("php/user_data_read.php", {
        // 送る情報なし
    }, function (res) {
        // console.log("res", res);
        const userData = JSON.parse(res);
        // console.log("userData", userData);
        const allDataCount = userData.length;

        // 項目ごとに多い順に並び替えして、件数も付与した配列を返す関数
        const sortData = dataSort(userData);

        // countが大きい順に並んだので表示していく
        let html = "<p>あなたの好みの傾向は・・・</p>";

        for (let i = 0; i < sortData.length; i++) {
            html += `
            <p>${sortData[i].category} が ${sortData[i].goodPoint} なもの : ${sortData[i].count}/${allDataCount}個</p>`;
        };

        // ボタンなど追加
        html += `
        <button class="closeButton button">閉じる</button>`;

        // 枠を表示
        $("#userInformation").css("display", "block");
        // タグを埋め込む
        $("#userInformation").html(html);

        // 作成したボタンをUIデザインに変更する
        $(".button").button();

    });
})

// 閉じるボタンの動作
$(document).on("click", ".closeButton", function () {
    $("#userInformation").html("");
    $("#userInformation").css("display", "none");
});

// =====================================
// 以下、関数まとめ
// =====================================

// 検索結果の配列を渡すと、必要な情報だけ引っこ抜いた配列を返してくれる関数
function sortData(data) {

    // 格納用の空配列作成
    const newData = [];

    // データの数だけ回して必要な情報だけ抜き取る
    for (let i = 0; i < data.length; i++) {
        newData[i] = {
            author: data[i].Item.author,
            authorKana: data[i].Item.authorKana,
            isbn: data[i].Item.isbn,
            itemCaption: data[i].Item.itemCaption,
            largeImageUrl: data[i].Item.largeImageUrl,
            publisherName: data[i].Item.publisherName,
            salesDate: data[i].Item.salesDate,
            seriesName: data[i].Item.seriesName,
            title: data[i].Item.title,
            titleKana: data[i].Item.titleKana,
            comment: "" // コメントを空で用意しておく
        }
    }
    return newData;
}

// 検索結果の配列を渡して中身を描画してくれる関数
function viewData(data) {

    // 何件ヒットしたかを表示
    $("#numberOfMatches").text("検索ヒット数：" + data.length + "件");

    // 検索結果のhtmlを作成
    let html = "";
    for (let i = 0; i < data.length; i++) {
        html += `
            <div class="viewBlock">
                <p>${data[i].title}</p>
                <div><img src="${data[i].largeImageUrl}" alt="${data[i].title}の表紙"></div>
                <p>${data[i].author}</p>
                <p>${data[i].itemCaption}</p>
                <p>${data[i].publisherName}</p>
                <p>${data[i].salesDate}</p>
                <p>${data[i].seriesName}</p>
            </div>
            `
    }
    // htmlを反映
    $("#result").html(html);

    // ここで作った要素なのでここでドラッグできるように設定する
    $(".viewBlock").draggable({
        helper: "clone", // クローンがドラッグされるようにする
        start: function (e, ui) {
            ui.helper.width($(this).width()); // クローンはbody直下に生成されるらしいので
            ui.helper.height($(this).height()); // %指定だとサイズがおかしくなるので元データのサイズを継承
        }
    });
}

// favorites_tableに保存されてるデータを取得する関数
// $_SESSION["userID"] で取得データを絞る
async function loadBookList() {
    console.log("loadBookList開始");

    await $.post("php/favorite_read.php", {

    }, function (res) {
        if (res) {
            // console.log("res", res);
            favoriteBookList = JSON.parse(res);
            // console.log("favoriteBookList", favoriteBookList);
            renderBookList(favoriteBookList);
        }
    });
}

// 受け取った保存データを一覧表示する関数
function renderBookList(list) {
    $("#bookList").empty(); // いったん中身消す

    list.forEach(book => {
        $("#bookList").append(`
            <div class="book" data-isbn="${book.isbn}">
                <p>${book.title}</p>
                <p>${book.author}</p>
                <img src="${book.largeImageUrl}">
            </div>
        `);
    });
}

// カテゴリ名を受け取って、小項目ボタンを表示する関数
function generateGoodPointButton(categoryName) {

    // 表示リセット
    $("#goodPointElements").html("");
    // 大項目と小項目それぞれ配列番号がそろうように
    const categoryList = ["ジャンル", "主人公", "設定"];
    const goodPointList = [
        ["ファンタジー", "SF", "ミステリー", "サスペンス", "ラブコメ", "群像劇", "スポーツ・競技"],
        ["最強", "権力者", "お人よし", "悪人", "お調子者", "野心家", "悪役令嬢", "おとなしい", "巻き込まれ体質"],
        ["剣と魔法", "ゲーム世界", "成り上がり", "転生", "転移", "勇者・聖女召喚", "悪役令嬢", "薬師、医師",
            "スローライフ", "農業", "商売", "食堂、料理", "領地開発", "星間国家", "戦争", "近未来",
            "メカ、ロボット", "レベル制", "スキルあり", "ゲームキャラ転生", "製造系チート", "学園", "超能力",
            "現代日本"]
    ]

    // htmlタグを生成する
    let html = "";
    for (let l = 0; l < categoryList.length; l++) {
        if (categoryName === categoryList[l]) {

            for (let i = 0; i < goodPointList[l].length; i++) {
                html += `
                <button class="goodPointButton button" data-category=${categoryList[l]}>${goodPointList[l][i]}</button>`
            }

        }
    }

    // 表示する
    $("#goodPointElements").html(html);

    // 作成したボタンをUIデザインに変更する
    $(".button").button();
}

// 詳細画面用に、isbn受け取ってここ好きポイントを表示する
async function goodPointRead(isbn) {
    await $.post("php/good_point_read.php", {
        isbn: isbn
    }, function (res) {
        // console.log("res:", res);
        // goodPoints = [{category: "ジャンル", goodPoint: "ファンタジー"},{.......}]
        const goodPoints = JSON.parse(res);
        // console.log("goodPoints:", goodPoints);
        let goodPointHtml = "";
        for (let i = 0; i < goodPoints.length; i++) {
            goodPointHtml += `${goodPoints[i].category}:${goodPoints[i].goodPoint} / `;
        }
        if (!goodPointHtml) {
            goodPointHtml = "登録済みの「ココ好き！」ポイントはありません";
        } else {
            goodPointHtml = "登録済みの「ココ好き！」ポイント <br> " + goodPointHtml;
        }
        $("#registeredView").html(goodPointHtml);
    });
}

// DBから取得したココ好きポイントデータを受け取って、多い項目順にソート、何件あるかを追加した配列を返す
function dataSort(data) {
    // 同じ項目のデータが何個あるかを保存していく
    for (let i = 0; i < data.length; i++) {
        data[i].count = 1; // 初期値１（１つ目なので）
        for (let c = i + 1; c < data.length; c++) {
            // console.log("i:", i);
            // console.log("c:", c);
            if (data[i].goodPoint === data[c].goodPoint) {
                // console.log("i と c が一致しました");
                // console.log("userData[i].count をプラス１して、userData[c]を削除、番号詰まるのでc--して調整");
                data[i].count++;
                data.splice(c, 1);
                c--;
                // console.log("削除後のuserData:", userData);
            }
        }
    }
    // [{category: "世界観", goodPoint: "ファンタジー", count: 6},{...}] みたいに並んでいる
    // 上から順にcountの数値を見て、数値が大きい順に並び変える
    const sortData = [];
    let number = 0;
    const length = data.length;
    for (let a = 0; a < length; a++) {
        // console.log("何回目のチェックか :", a);
        for (let i = 0; i < data.length; i++) {
            if (data[i].count > data[number].count) {
                // console.log("入れ替え前");
                // console.log("array1[i]", userData[i].count);
                // console.log("array1[number]", userData[number].count);
                number = i;
                // console.log("入れ替え後");
                // console.log("array1[i]", userData[i].count);
                // console.log("array1[number]", userData[number].count);
            }
        }
        // console.log("最大値の入ってる配列番号がnumberに入ってるはず");
        // console.log("number:", number);
        sortData.push(data[number]);
        // console.log("sortData:", sortData);
        data.splice(number, 1);
        number = 0;
    }
    return sortData;
}