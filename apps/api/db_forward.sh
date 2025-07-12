#!/bin/bash

LOCAL_PORT=15432
BASTION_HOST_NAME="TsFullstackTodoBastionHost-dev"
DATABASE_SECRET_NAME_PREFIX="TsFullstackTodoAppDataStack"

set -e

cleanup() {
  echo "Cleaning up..."
  kill "$ssm_pid" 2>/dev/null || true
}

trap cleanup EXIT

instance_id=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=${BASTION_HOST_NAME}" "Name=instance-state-name,Values=running" \
    --query "Reservations[*].Instances[*].InstanceId" --output text)

secret_value=$(aws secretsmanager get-secret-value \
    --secret-id "$(aws secretsmanager list-secrets --query "SecretList[?contains(Name, '${DATABASE_SECRET_NAME_PREFIX}')].Name" --output text)" \
    --query "SecretString" --output text)

db_host=$(echo "$secret_value" | jq -r '.host')
db_port=$(echo "$secret_value" | jq -r '.port')

aws ssm start-session \
    --target "$instance_id" \
    --document-name AWS-StartPortForwardingSessionToRemoteHost \
    --parameters '{"host":["'"$db_host"'"],"portNumber":["'"$db_port"'"],"localPortNumber":["'"$LOCAL_PORT"'"]}' &
ssm_pid=$!

db_user=$(echo "$secret_value" | jq -r '.username')
db_password=$(echo "$secret_value" | jq -r '.password')
export DATABASE_URL="postgresql://${db_user}:${db_password}@127.0.0.1:${LOCAL_PORT}/postgres?schema=public"

echo "$DATABASE_URL"
wait "$ssm_pid"