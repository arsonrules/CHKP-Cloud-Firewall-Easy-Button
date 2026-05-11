# 任務清單：Check Point CGNS IaC Easy Input

- [ ] 階段一：專案基礎建設與容器化準備
  - [ ] 建立 `/frontend` 目錄並初始化 React Vite 專案。
  - [ ] 建立 `/backend` 目錄並初始化 Node.js Express 專案。
  - [ ] 引入必要的圖示資源 (`/Users/arson/Documents/workspace/side project/vibe/CHKP_IaC_Easy_Button/icon` 目錄中的圖片)。
  - [ ] 設定 Cyberpunk 風格的 CSS。
  - [ ] 撰寫 `/frontend/Dockerfile` (Node 編譯 + Nginx 部署)。
  - [ ] 撰寫 `/backend/Dockerfile` (Node 環境，需包含 git 工具)。
  - [ ] 建立 `docker-compose.yml` 以利一鍵啟動前後端。

- [ ] 階段二：後端核心功能實作
  - [ ] 實作 Repo 下載模組：根據不同 Provider 對應的 GitHub Repo 進行 Clone。
  - [ ] 實作目錄解析模組：掃描取得的 Repo，列出可用的 submodules 供前端選擇。
  - [ ] 實作 HCL 解析器：讀取並解析 `variables.tf`，提取變數名稱、類型、描述、預設值及 validation 條件。
  - [ ] 實作 README 解析器：從 `README.md` 中提取特定變數的可用選項（補足 `variables.tf` 無法涵蓋的下拉選單需求）。
  - [ ] 實作檔案生成器：根據前端傳遞的使用者輸入產生 Terraform 檔案，並將其打包為 ZIP 格式供前端下載。
  - [ ] 實作錯誤處理與日誌：若必填資料缺失或不符格式，產生 `Error.log` 並回傳前端。

- [ ] 階段三：前端 UI 元件開發
  - [ ] 實作遊戲化進度條 (Progress Bar) 元件，明確顯示當前操作步驟。
  - [ ] 實作「步驟一：基礎設定」：包含「Provider」選擇下拉選單（移除原本的本機路徑輸入框）。
  - [ ] 實作「步驟二：模組選擇」：動態列出所選 Provider 下所有可用的 submodules。
  - [ ] 實作「步驟三：參數輸入」：
    - [ ] 根據後端回傳的變數清單動態生成表單，必填欄位加上顯著標記。
    - [ ] 支援 Dropdown menu 選擇。
    - [ ] 表單即時驗證機制。
  - [ ] 實作「步驟四：產生檔案」：包含 "Download Terraform Files" 按鈕，點擊後觸發瀏覽器下載 ZIP，或顯示 Error.log 內容。

- [ ] 階段四：前後端整合與測試
  - [ ] 串接前端 API 請求至後端。
  - [ ] 進行端到端 (E2E) 測試，驗證從選擇 Provider 到下載 ZIP 的完整流程。
  - [ ] UI/UX 優化，確保 Cyberpunk 風格與互動遊戲感符合預期。

- [ ] 階段五：Docker 容器化測試
  - [ ] 驗證 Frontend 容器與 Backend 容器的網路相連。
  - [ ] 確保跨平台執行 `docker-compose up -d` 能夠順利建置與啟動。
  - [ ] 驗證 ZIP 檔案下載機制在容器化環境中的可行性。
