import { Octokit } from '@octokit/rest';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'cmcmaster1';
const GITHUB_REPO = process.env.GITHUB_REPO || 'rheum_biologics';

let octokit: Octokit | null = null;

function getOctokit() {
  if (octokit) return octokit;

  if (!GITHUB_TOKEN) {
    return null;
  }

  octokit = new Octokit({
    auth: GITHUB_TOKEN,
  });

  return octokit;
}

export type FeedbackType = 'bug' | 'feature' | 'new_medication' | 'new_indication';

const typeLabels: Record<FeedbackType, string[]> = {
  bug: ['bug', 'feedback'],
  feature: ['enhancement', 'feedback'],
  new_medication: ['medication', 'feedback'],
  new_indication: ['indication', 'feedback']
};

const typeEmojis: Record<FeedbackType, string> = {
  bug: '🐛',
  feature: '✨',
  new_medication: '💊',
  new_indication: '🏥'
};

export async function createFeedbackIssue(params: {
  type: FeedbackType;
  message: string;
  contact?: string;
  meta?: Record<string, any>;
}) {
  const { type, message, contact, meta } = params;
  
  const client = getOctokit();
  
  if (!client) {
    // Graceful degrade: log to console for environments without GitHub token
    console.warn('[githubService] No GitHub token configured; feedback issue not created.');
    console.info('[githubService] Type:', type);
    console.info('[githubService] Message:', message);
    console.info('[githubService] Contact:', contact);
    console.info('[githubService] Meta:', meta);
    return { created: false, issueNumber: null };
  }

  const title = `${typeEmojis[type]} [Feedback] ${type.replace('_', ' ')}`;
  
  const body = [
    `## Feedback Type: ${type}`,
    '',
    '## Message',
    message,
    '',
    contact ? `## Contact Information\n${contact}` : '',
    '',
    '## Additional Information',
    meta ? `\`\`\`json\n${JSON.stringify(meta, null, 2)}\n\`\`\`` : 'No additional metadata provided.',
    '',
    '---',
    '*This issue was automatically created from user feedback.*'
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const response = await client.rest.issues.create({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      title,
      body,
      labels: typeLabels[type]
    });

    console.log(`[githubService] Created issue #${response.data.number}: ${title}`);
    return { created: true, issueNumber: response.data.number, url: response.data.html_url };
  } catch (error) {
    console.error('[githubService] Failed to create issue:', error);
    throw error;
  }
}
