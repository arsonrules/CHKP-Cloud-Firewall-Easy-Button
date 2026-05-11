# 實作計畫：Check Point CGNS IaC Easy Input

本計畫旨在設計一個互動式且遊戲化的網頁應用程式，協助使用者客製化並產生 Check Point CloudGuard Network Security (CGNS) 的 Terraform 基礎架構即代碼 (IaC)，並全面支援 Docker 容器化部署。

## Proposed Changes

### 專案結構初始化 (Project Initialization)
#### [NEW] `/frontend` (React Vite 專案)
包含 Cyberpunk 風格的 UI 元件、遊戲化進度條。
#### [NEW] `/backend` (Node.js Express 專案)
處理 GitHub Repo clone、解析 Terraform 模組、產生檔案及 `Error.log`。
#### [NEW] `docker-compose.yml` & `Dockerfile`
建立前後端的獨立 `Dockerfile` 以及整合網路的 `docker-compose.yml`，確保跨平台使用者只需一行指令即可啟動服務。

### 前端 UI/UX 設計 (Frontend Design)
#### [NEW] 核心風格 (Cyberpunk)
採用霓虹配色、深色背景、科技感字體與互動式微動畫 (hover 效果)。所有圖片與 Icon 將取自指定的 `/Users/arson/Documents/workspace/side project/vibe/CHKP_IaC_Easy_Button/icon` 目錄。
#### [NEW] 進度條 (Progress Bar)
位於畫面上方，顯示當前步驟 (1. 選擇 Provider -> 2. 選擇 Module -> 3. 填寫變數 -> 4. 完成/下載 ZIP 檔)。
#### [NEW] 互動表單元件 (Interactive Forms)
根據後端解析的 `variables.tf` 動態產生表單。必填欄位特別標示。具備選項的欄位 (由 validation 或 README 判斷) 以 Dropdown menu 呈現。若未填寫必填資訊，前端會即時跳出警告。

### 後端 API 開發 (Backend Development)
#### [NEW] Repo 下載與解析 API
負責接收 Provider 選擇，透過 `git clone` 抓取對應的 Github Repo。(Docker Backend 容器內需安裝 `git`)
解析 Repo 資料夾結構，回傳可用的 submodules 列表。
#### [NEW] 變數解析 API
讀取選定 module/submodule 下的 `variables.tf` 與 `README.md`，辨識所需變數、預設值及限制，傳遞給前端動態生成表單。
#### [NEW] 檔案生成 API
接收前端傳送的 User Input，根據輸入動態生成 Terraform 檔案內容。
將產生的所有檔案打包為 ZIP 資料流 (Stream)，直接回傳給前端供使用者下載。
若有欄位缺失或格式錯誤，生成 `Error.log` 並回傳。

## Verification Plan

### Automated Tests
- 後端撰寫單元測試，驗證解析器能否正確解析不同 Provider 的 `variables.tf`，擷取必填欄位與 Validation rules。
- 驗證壓縮打包 (ZIP) 機制是否能正確包含所有生成的檔案。

### Manual Verification
- 啟動 `docker-compose up`，測試前後端容器通訊是否正常。
- 實際操作流程：選擇 AWS -> 選擇模組 -> 故意漏填必填欄位檢查 `Error.log` 機制。
- 完整填寫後，點擊生成按鈕，驗證瀏覽器是否成功下載包含正確 Terraform 代碼的 ZIP 壓縮檔。
