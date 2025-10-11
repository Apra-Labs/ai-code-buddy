#!/bin/bash

# Pipeline Monitor for ai-code-buddy
# Monitors the latest pipeline build in real-time

set -euo pipefail

WORKSPACE="${BITBUCKET_WORKSPACE:-kumaakh}"
REPO="${BITBUCKET_REPO:-ai-code-buddy}"
BRANCH="${1:-fix/bitbucket-pipelines-empty-command}"
POLL_INTERVAL=5

if [ -z "${BITBUCKET_USERNAME:-}" ] || [ -z "${BITBUCKET_APP_PASSWORD:-}" ]; then
    echo "Error: BITBUCKET_USERNAME and BITBUCKET_APP_PASSWORD must be set"
    exit 1
fi

API_BASE="https://api.bitbucket.org/2.0/repositories/$WORKSPACE/$REPO"

log() {
    echo "[$(date '+%H:%M:%S')] $*"
}

# Find latest pipeline for branch
find_latest_pipeline() {
    local pipelines_url="$API_BASE/pipelines?pagelen=5&sort=-created_on"
    curl -s -u "$BITBUCKET_USERNAME:$BITBUCKET_APP_PASSWORD" "$pipelines_url" | \
        jq -r ".values[] | select(.target.ref_name == \"$BRANCH\") | .uuid" | head -1 | tr -d '{}'
}

# Get pipeline status
get_pipeline_status() {
    local uuid="$1"
    local encoded_uuid="%7B${uuid}%7D"
    local pipeline_url="$API_BASE/pipelines/$encoded_uuid"
    curl -s -u "$BITBUCKET_USERNAME:$BITBUCKET_APP_PASSWORD" "$pipeline_url"
}

# Get pipeline steps
get_pipeline_steps() {
    local uuid="$1"
    local encoded_uuid="%7B${uuid}%7D"
    local steps_url="$API_BASE/pipelines/$encoded_uuid/steps/"
    curl -s -u "$BITBUCKET_USERNAME:$BITBUCKET_APP_PASSWORD" "$steps_url"
}

log "🔍 Finding latest pipeline for branch: $BRANCH"
PIPELINE_UUID=$(find_latest_pipeline)

if [ -z "$PIPELINE_UUID" ]; then
    log "❌ No pipeline found for branch $BRANCH"
    exit 1
fi

log "✅ Found pipeline: $PIPELINE_UUID"
log "🔗 URL: https://bitbucket.org/$WORKSPACE/$REPO/pipelines/results/$PIPELINE_UUID"
log ""

LAST_STATE=""
LAST_STEPS=""

while true; do
    PIPELINE_INFO=$(get_pipeline_status "$PIPELINE_UUID")

    STATE=$(echo "$PIPELINE_INFO" | jq -r '.state.name')
    RESULT=$(echo "$PIPELINE_INFO" | jq -r '.state.result.name // "N/A"')
    BUILD_NUM=$(echo "$PIPELINE_INFO" | jq -r '.build_number')

    if [ "$STATE" != "$LAST_STATE" ]; then
        if [ "$STATE" = "COMPLETED" ]; then
            if [ "$RESULT" = "SUCCESSFUL" ]; then
                log "✅ Pipeline #$BUILD_NUM COMPLETED: $RESULT"
            else
                log "❌ Pipeline #$BUILD_NUM COMPLETED: $RESULT"

                # Show error if YAML parsing failed
                ERROR_MSG=$(echo "$PIPELINE_INFO" | jq -r '.state.result.error.message // empty')
                if [ -n "$ERROR_MSG" ]; then
                    log "   Error: $ERROR_MSG"
                fi
            fi
            break
        elif [ "$STATE" = "IN_PROGRESS" ]; then
            log "⏳ Pipeline #$BUILD_NUM is running..."
        elif [ "$STATE" = "PENDING" ]; then
            log "⏳ Pipeline #$BUILD_NUM is pending..."
        fi
        LAST_STATE="$STATE"
    fi

    # Show step progress
    if [ "$STATE" = "IN_PROGRESS" ]; then
        STEPS_INFO=$(get_pipeline_steps "$PIPELINE_UUID")
        STEPS_SUMMARY=$(echo "$STEPS_INFO" | jq -r '.values[] | "   " + .name + ": " + .state.name + " (" + (.state.result.name // "running") + ")"')

        if [ "$STEPS_SUMMARY" != "$LAST_STEPS" ]; then
            echo "$STEPS_SUMMARY"
            LAST_STEPS="$STEPS_SUMMARY"
        fi
    fi

    sleep $POLL_INTERVAL
done

log ""
log "📊 Final Status: $STATE - $RESULT"

# If failed, fetch logs
if [ "$RESULT" != "SUCCESSFUL" ]; then
    log "🔍 Fetching failure logs..."

    if [ -f "temp/apra-lic-mgr/scripts/fetch-logs.sh" ]; then
        bash temp/apra-lic-mgr/scripts/fetch-logs.sh "$PIPELINE_UUID"
    else
        log "⚠️  fetch-logs.sh not found, cannot download logs automatically"
    fi
else
    log "🎉 Pipeline succeeded!"
fi
