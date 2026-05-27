@echo off
echo ============================================
echo Building Dashboard Project Structure...
echo ============================================
echo.

echo Creating main directory...
mkdir dashboard
cd dashboard

echo Creating subdirectories...
mkdir src\components\layout
mkdir src\components\dashboard
mkdir src\components\trending
mkdir src\components\workflow
mkdir src\components\projects
mkdir src\components\common
mkdir src\pages
mkdir src\hooks
mkdir src\store
mkdir src\types
mkdir src\lib
mkdir public

echo Creating layout components...
type nul > src\components\layout\Sidebar.tsx
type nul > src\components\layout\TopBar.tsx
type nul > src\components\layout\DashboardLayout.tsx

echo Creating dashboard components...
type nul > src\components\dashboard\StatsCards.tsx
type nul > src\components\dashboard\RecentActivity.tsx
type nul > src\components\dashboard\PerformanceChart.tsx
type nul > src\components\dashboard\QuickActions.tsx

echo Creating trending components...
type nul > src\components\trending\TrendingHeatmap.tsx
type nul > src\components\trending\TopicList.tsx
type nul > src\components\trending\ViralScoreChart.tsx

echo Creating workflow components...
type nul > src\components\workflow\KanbanBoard.tsx
type nul > src\components\workflow\ContentCard.tsx
type nul > src\components\workflow\StageColumn.tsx
type nul > src\components\workflow\WorkflowEditor.tsx

echo Creating project components...
type nul > src\components\projects\ProjectList.tsx
type nul > src\components\projects\ProjectCard.tsx
type nul > src\components\projects\NewProjectDialog.tsx

echo Creating common components...
type nul > src\components\common\StatusBadge.tsx
type nul > src\components\common\ViralScoreBadge.tsx
type nul > src\components\common\DateDisplay.tsx

echo Creating pages...
type nul > src\pages\DashboardPage.tsx
type nul > src\pages\TrendingPage.tsx
type nul > src\pages\WorkflowPage.tsx
type nul > src\pages\ProjectsPage.tsx
type nul > src\pages\CalendarPage.tsx
type nul > src\pages\SettingsPage.tsx

echo Creating hooks...
type nul > src\hooks\useContentItems.ts
type nul > src\hooks\useTrendingTopics.ts
type nul > src\hooks\useProjects.ts
type nul > src\hooks\useStats.ts

echo Creating store and types...
type nul > src\store\useDashboardStore.ts
type nul > src\types\index.ts

echo Creating lib files...
type nul > src\lib\api.ts
type nul > src\lib\utils.ts

echo Creating root src files...
type nul > src\App.tsx
type nul > src\main.tsx
type nul > src\index.css

echo Creating project root files...
type nul > index.html
type nul > package.json
type nul > vite.config.ts
type nul > tailwind.config.js
type nul > tsconfig.json

echo.
echo ============================================
echo SUCCESS: Project structure created!
echo ============================================
echo.
pause