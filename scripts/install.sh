#!/bin/bash
# Install dependencies and filter out deprecation warnings
npm ci --no-audit --no-fund --prefer-offline 2>&1 | grep -v "deprecated" || true
exit ${PIPESTATUS[0]}

