#!/bin/bash
set -e

BUCKET_NAME="travel-guide-app"
FUNCTION_REGION="us-central1"

# Parse arguments
DEPLOY_FRONTEND=false
DEPLOY_FUNCTIONS=false

if [ $# -eq 0 ]; then
  DEPLOY_FRONTEND=true
  DEPLOY_FUNCTIONS=true
else
  for arg in "$@"; do
    case $arg in
      --frontend) DEPLOY_FRONTEND=true ;;
      --functions) DEPLOY_FUNCTIONS=true ;;
      --all) DEPLOY_FRONTEND=true; DEPLOY_FUNCTIONS=true ;;
    esac
  done
fi

# Deploy Cloud Functions
if [ "$DEPLOY_FUNCTIONS" = true ]; then
  echo "☁️  Deploying Cloud Functions..."
  cd functions
  npm run build

  gcloud functions deploy travel-guide-api \
    --gen2 \
    --runtime=nodejs20 \
    --region=$FUNCTION_REGION \
    --source=. \
    --entry-point=api \
    --trigger-http \
    --allow-unauthenticated \
    --set-env-vars="GCS_BUCKET=travel-guide-data,ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}"

  cd ..

  FUNCTION_URL=$(gcloud functions describe travel-guide-api --region=$FUNCTION_REGION --gen2 --format='value(serviceConfig.uri)')
  echo "✅ Cloud Function deployed at: $FUNCTION_URL"
fi

# Deploy Frontend
if [ "$DEPLOY_FRONTEND" = true ]; then
  echo ""
  echo "🔨 Building frontend..."
  npm run build

  echo "📦 Deploying to gs://$BUCKET_NAME..."

  # Create bucket if it doesn't exist
  if ! gsutil ls -b "gs://$BUCKET_NAME" &>/dev/null; then
    echo "Creating bucket gs://$BUCKET_NAME..."
    gsutil mb -l us-central1 "gs://$BUCKET_NAME"

    # Enable uniform bucket-level access
    gsutil uniformbucketlevelaccess set on "gs://$BUCKET_NAME"

    # Make bucket publicly readable
    gsutil iam ch allUsers:objectViewer "gs://$BUCKET_NAME"
  fi

  # Set website configuration
  gsutil web set -m index.html -e index.html "gs://$BUCKET_NAME"

  # Sync dist folder to bucket
  gsutil -m rsync -r -d dist "gs://$BUCKET_NAME"

  # Set cache headers for different file types
  echo "Setting cache headers..."

  # HTML files - no cache (for updates)
  gsutil setmeta -h "Cache-Control:no-cache, no-store, must-revalidate" -h "Pragma:no-cache" "gs://$BUCKET_NAME/index.html" 2>/dev/null || true

  # Manifest - no cache
  gsutil setmeta -h "Cache-Control:no-cache, no-store, must-revalidate" -h "Pragma:no-cache" "gs://$BUCKET_NAME/manifest.webmanifest" 2>/dev/null || true

  # Service worker files - no cache (critical for updates)
  gsutil setmeta -h "Cache-Control:no-cache, no-store, must-revalidate" -h "Pragma:no-cache" "gs://$BUCKET_NAME/sw.js" 2>/dev/null || true
  gsutil setmeta -h "Cache-Control:no-cache, no-store, must-revalidate" -h "Pragma:no-cache" "gs://$BUCKET_NAME/registerSW.js" 2>/dev/null || true
  gsutil setmeta -h "Cache-Control:no-cache, no-store, must-revalidate" -h "Pragma:no-cache" "gs://$BUCKET_NAME/workbox-"*".js" 2>/dev/null || true

  # JS/CSS with hashes - long cache (these have unique names per build)
  gsutil -m setmeta -h "Cache-Control:public, max-age=31536000, immutable" "gs://$BUCKET_NAME/assets/*" 2>/dev/null || true

  echo ""
  echo "✅ Frontend deployed!"
  echo "🌐 Your app is available at: https://storage.googleapis.com/$BUCKET_NAME/index.html"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Usage:"
echo "  ./deploy.sh              Deploy everything"
echo "  ./deploy.sh --frontend   Deploy frontend only"
echo "  ./deploy.sh --functions  Deploy Cloud Functions only"
