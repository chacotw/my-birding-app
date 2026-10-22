我的鳥圖鑑 PWA 原型 v0.2

新增每個鳥種的 Google 相簿網址與封面設定。封面可先從裝置選取、縮小後存在瀏覽器本機；圖鑑會顯示封面。

重要：Google Photos Picker API 尚未串接。直接從 Google 相簿選封面，需要先設定 Google Cloud 專案、OAuth 與 Photos Picker API。這一版不能自動掃描所有既有相簿。資料仍存在瀏覽器本機，請定期備份。正式版建議將照片縮圖儲存改用 IndexedDB。
