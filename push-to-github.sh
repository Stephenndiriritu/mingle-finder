#!/bin/bash

# Script to push Mingle Finder to GitHub
# Usage: ./push-to-github.sh YOUR_GITHUB_USERNAME

if [ -z "$1" ]; then
    echo "❌ Error: Please provide your GitHub username"
    echo "Usage: ./push-to-github.sh YOUR_GITHUB_USERNAME"
    echo ""
    echo "Example: ./push-to-github.sh johndoe"
    exit 1
fi

USERNAME=$1
REPO_NAME="mingle-finder"

echo "🚀 Setting up GitHub remote for $USERNAME/$REPO_NAME"

# Check if remote already exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  Remote 'origin' already exists. Removing it..."
    git remote remove origin
fi

# Add the new remote
echo "📡 Adding GitHub remote..."
git remote add origin https://github.com/$USERNAME/$REPO_NAME.git

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin master

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Successfully pushed to GitHub!"
    echo "📍 Your repository: https://github.com/$USERNAME/$REPO_NAME"
    echo ""
    echo "Next steps:"
    echo "1. Visit your repository on GitHub"
    echo "2. Add PayPal sandbox credentials to test payments"
    echo "3. Deploy to your preferred platform"
    echo ""
    echo "📚 Documentation:"
    echo "- PayPal Setup: See PAYPAL_SETUP.md"
    echo "- GitHub Guide: See GITHUB_PUSH_GUIDE.md"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "1. Repository exists on GitHub"
    echo "2. You have push permissions"
    echo "3. Your GitHub authentication is set up"
    echo ""
    echo "Manual commands:"
    echo "git remote add origin https://github.com/$USERNAME/$REPO_NAME.git"
    echo "git push -u origin master"
fi
