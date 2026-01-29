-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "cognito_sub" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_cognito_sub_key" ON "user_profiles"("cognito_sub");
