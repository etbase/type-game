# 英文打字金幣挑戰

瀏覽器就能玩的英文打字遊戲。金幣從畫面上方落下，中央顯示要打的英文，下方顯示 Credits。在金幣碰到終點線前打對，就能收下這一題的金幣。

不需安裝軟體，用 Chrome、Edge 或 Safari 開啟即可。

## 主要規則

- 金幣從上方下降；中央是英文，下方是 Credits。
- 必須在金幣碰到終點線前打對內容。
- 遊戲開始後沒有暫停。切換分頁或關閉視窗，視同放棄。
- 每關 20 題。
- 放棄正在進行的關卡，本關分數直接歸零。

## 本機執行

需要 Node.js 20 以上。

```bash
npm install
npm run dev
```

瀏覽器打開 [http://localhost:43145](http://localhost:43145)。

若要用 GitHub Desktop：把這個資料夾放到你想要的位置（例如「文件」），之後只要 commit / push 即可。

## 公開給別人玩（GitHub Pages）

1. 把這個 repo 推上 GitHub，並設成 **Public**。
2. 打開 repo 的 **Settings → Pages**。
3. Source 選 **GitHub Actions**。
4. 推送到 `main` 後，workflow 會自動建置並發布。

網址通常是：

`https://<你的帳號>.github.io/<repo 名稱>/`

## 金幣圖片

遊戲金幣不是 emoji，而是放在 `public/coins/` 的繪製圖片：

- `coin-front.png`
- `coin-turn-right.png`
- `coin-edge.png`
- `coin-turn-left.png`
- `coin-sparkle.png`

旋轉落下時會依序切換這些畫面。
