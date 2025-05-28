/*
  Warnings:

  - You are about to drop the column `isDone` on the `Task` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "isDone",
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'NOT_STARTED';
