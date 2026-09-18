-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ScopeTeam" (
    "scope" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,

    PRIMARY KEY ("scope", "teamId"),
    CONSTRAINT "ScopeTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MetricRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "teamId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "sub" TEXT NOT NULL DEFAULT '전체',
    "actual" REAL NOT NULL,
    "target" REAL NOT NULL,
    "prevYearActual" REAL NOT NULL,
    CONSTRAINT "MetricRecord_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MetricRecord_year_month_metric_idx" ON "MetricRecord"("year", "month", "metric");

-- CreateIndex
CREATE UNIQUE INDEX "MetricRecord_year_month_teamId_metric_sub_key" ON "MetricRecord"("year", "month", "teamId", "metric", "sub");
