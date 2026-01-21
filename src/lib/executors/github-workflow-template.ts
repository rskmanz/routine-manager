// GitHub Action workflow template for claude-code-action
// Users should copy this to their repository's .github/workflows/ directory

export const GITHUB_WORKFLOW_TEMPLATE = `name: Claude Code Action
on:
  issues:
    types: [opened, labeled]

jobs:
  claude:
    # Only run if the issue has the 'claude-code-action' label
    if: contains(github.event.issue.labels.*.name, 'claude-code-action')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Run Claude Code Action
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: \${{ secrets.ANTHROPIC_API_KEY }}
          github_token: \${{ secrets.GITHUB_TOKEN }}
`

export const GITHUB_WORKFLOW_FILENAME = 'claude-code-action.yml'

export const SETUP_INSTRUCTIONS = `
## Setup Instructions

1. **Create the workflow file**
   Copy the workflow template to your repository:
   \`.github/workflows/claude-code-action.yml\`

2. **Add the Anthropic API key**
   Go to your repository Settings > Secrets and variables > Actions
   Add a new secret named \`ANTHROPIC_API_KEY\` with your Anthropic API key

3. **Create the labels (optional)**
   The workflow will auto-create labels, but you can manually create:
   - \`routine-manager\` - Identifies issues from Routine Manager
   - \`claude-code-action\` - Triggers the Claude workflow

4. **Test the integration**
   Create a routine in Routine Manager and click "Run"
   An issue will be created that triggers the workflow

## Required Permissions

Your GitHub Personal Access Token needs:
- \`repo\` scope for private repositories
- \`public_repo\` scope for public repositories only

## Troubleshooting

- **Issue not triggering workflow**: Check that the labels exist and workflow file is valid
- **Permission denied**: Verify your GITHUB_TOKEN has write access
- **Claude not responding**: Check ANTHROPIC_API_KEY is set correctly in repository secrets
`

export function getWorkflowMarkdown(): string {
  return `\`\`\`yaml
${GITHUB_WORKFLOW_TEMPLATE}
\`\`\``
}
