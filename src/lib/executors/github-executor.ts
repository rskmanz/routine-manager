import { Octokit } from 'octokit'
import { BaseExecutor } from './base-executor'
import type { Routine, ExecutorConfig } from '@/types'
import type { ExecutionResult } from '@/types/executor'

export class GitHubActionExecutor extends BaseExecutor {
  type = 'github-action'
  name = 'GitHub Action'
  description = 'Create GitHub issues that trigger claude-code-action workflows'

  private octokit: Octokit | null = null

  private getOctokit(): Octokit {
    if (!this.octokit) {
      const token = process.env.GITHUB_TOKEN
      if (!token) {
        throw new Error('GITHUB_TOKEN environment variable is not set')
      }
      this.octokit = new Octokit({ auth: token })
    }
    return this.octokit
  }

  async validateConfig(config: ExecutorConfig): Promise<{ valid: boolean; errors?: string[] }> {
    const errors: string[] = []

    if (!config.githubRepo) {
      errors.push('GitHub repository is required')
    } else if (!config.githubRepo.includes('/')) {
      errors.push('Repository must be in format: owner/repo')
    } else {
      const parts = config.githubRepo.split('/')
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        errors.push('Repository must be in format: owner/repo')
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  async execute(routine: Routine): Promise<ExecutionResult> {
    const startedAt = new Date().toISOString()

    try {
      const { githubRepo } = routine.integration.config

      if (!githubRepo) {
        return this.createResult(false, undefined, 'GitHub repository not configured', startedAt)
      }

      // Check if token is available
      if (!process.env.GITHUB_TOKEN) {
        return this.createResult(
          false,
          undefined,
          'GITHUB_TOKEN environment variable is not set. Please configure it in your .env.local file.',
          startedAt
        )
      }

      const [owner, repo] = githubRepo.split('/')

      if (!owner || !repo) {
        return this.createResult(false, undefined, 'Invalid repository format. Use: owner/repo', startedAt)
      }

      const octokit = this.getOctokit()

      // Build the issue body from routine blocks
      const issueBody = this.buildIssueBody(routine)
      const issueTitle = `[Routine] ${routine.title}`

      // Create the issue
      const { data: issue } = await octokit.rest.issues.create({
        owner,
        repo,
        title: issueTitle,
        body: issueBody,
        labels: ['routine-manager', 'claude-code-action'],
      })

      const output = [
        `Issue created successfully!`,
        ``,
        `URL: ${issue.html_url}`,
        `Number: #${issue.number}`,
        ``,
        `The claude-code-action workflow will be triggered automatically.`,
        `Check the issue for updates and the resulting PR.`,
      ].join('\n')

      return {
        ...this.createResult(true, output, undefined, startedAt),
        issueUrl: issue.html_url,
        issueNumber: issue.number,
      }
    } catch (error) {
      const errorMessage = this.handleGitHubError(error)
      return this.createResult(false, undefined, errorMessage, startedAt)
    }
  }

  private handleGitHubError(error: unknown): string {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()

      // Handle specific GitHub API errors
      if (message.includes('not found') || message.includes('404')) {
        return 'Repository not found. Please check the repository name and your access permissions.'
      }

      if (message.includes('forbidden') || message.includes('403')) {
        return 'Access denied. Please check that your GITHUB_TOKEN has write access to this repository.'
      }

      if (message.includes('rate limit') || message.includes('429')) {
        return 'GitHub API rate limit exceeded. Please wait a moment and try again.'
      }

      if (message.includes('unauthorized') || message.includes('401')) {
        return 'Invalid or expired GITHUB_TOKEN. Please check your token configuration.'
      }

      if (message.includes('validation failed') || message.includes('422')) {
        return 'Validation failed. The repository may not have issues enabled or the labels may not exist.'
      }

      return error.message
    }

    return 'Unknown error occurred while creating GitHub issue'
  }

  private buildIssueBody(routine: Routine): string {
    let body = `# ${routine.title}\n\n`

    if (routine.blocks.length > 0) {
      body += `## Instructions\n\n`

      for (const block of routine.blocks) {
        switch (block.type) {
          case 'heading':
            body += `### ${block.content}\n\n`
            break
          case 'checklist':
            body += `- [ ] ${block.content}\n`
            break
          case 'trigger':
            body += `**Trigger:** ${block.content}\n\n`
            break
          case 'action':
            body += `**Action:** ${block.content}\n\n`
            break
          default:
            body += `${block.content}\n\n`
        }
      }
    }

    body += `\n---\n\n`
    body += `*This issue was automatically created by [Routine Manager](https://github.com/anthropics/routine-manager)*\n\n`
    body += `**Routine ID:** \`${routine.id}\`\n`
    body += `**Created:** ${new Date().toISOString()}\n`

    return body
  }

  async isAvailable(): Promise<boolean> {
    return !!process.env.GITHUB_TOKEN
  }

  // Check if the repository is accessible (optional validation)
  async checkRepositoryAccess(repo: string): Promise<{ accessible: boolean; error?: string }> {
    try {
      if (!process.env.GITHUB_TOKEN) {
        return { accessible: false, error: 'GITHUB_TOKEN not configured' }
      }

      const [owner, repoName] = repo.split('/')
      if (!owner || !repoName) {
        return { accessible: false, error: 'Invalid repository format' }
      }

      const octokit = this.getOctokit()
      await octokit.rest.repos.get({ owner, repo: repoName })

      return { accessible: true }
    } catch (error) {
      return { accessible: false, error: this.handleGitHubError(error) }
    }
  }
}
