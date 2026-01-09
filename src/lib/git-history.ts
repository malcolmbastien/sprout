import { simpleGit } from 'simple-git';

const git = simpleGit();

export interface CommitInfo {
	date: string;
	message: string;
	hash: string;
	insertions: number;
	deletions: number;
}

export async function getFileHistory(filePath: string): Promise<CommitInfo[]> {
	try {
		const basicLog = await git.log({ file: filePath });
		
		const historyWithStats = await Promise.all(basicLog.all.map(async (commit) => {
			const show = await git.show(['--stat', '--format=', commit.hash, '--', filePath]);
			const lines = show.trim().split('\n');
			const summaryLine = lines[lines.length - 1];
			
			let insertions = 0;
			let deletions = 0;

			if (summaryLine && summaryLine.includes('changed')) {
				const insMatch = summaryLine.match(/(\d+) insertion/);
				const delMatch = summaryLine.match(/(\d+) deletion/);
				if (insMatch) insertions = parseInt(insMatch[1]);
				if (delMatch) deletions = parseInt(delMatch[1]);
			}

			return {
				date: commit.date,
				message: commit.message,
				hash: commit.hash,
				insertions,
				deletions
			};
		}));

		return historyWithStats;
	} catch (error) {
		console.error(`Error fetching git history for ${filePath}:`, error);
		return [];
	}
}

export async function getFileDates(filePath: string): Promise<{ created: Date | null, updated: Date | null }> {
	try {
		const history = await getFileHistory(filePath);
		if (history.length === 0) {
			return { created: null, updated: null };
		}
		return {
			created: new Date(history[history.length - 1].date),
			updated: new Date(history[0].date),
		};
	} catch (error) {
		console.error(`Error fetching git dates for ${filePath}:`, error);
		return { created: null, updated: null };
	}
}

export async function getAllCommits(): Promise<CommitInfo[]> {
	try {
		const log = await git.log();
		return log.all.map(commit => ({
			date: commit.date,
			message: commit.message,
			hash: commit.hash,
			insertions: 0,
			deletions: 0
		}));
	} catch (error) {
		console.error('Error fetching all git commits:', error);
		return [];
	}
}

export async function getPostsCommits(): Promise<CommitInfo[]> {
	try {
		const log = await git.log(['--', 'src/content/posts/']);
		return log.all.map(commit => ({
			date: commit.date,
			message: commit.message,
			hash: commit.hash,
			insertions: 0,
			deletions: 0
		}));
	} catch (error) {
		console.error('Error fetching posts git commits:', error);
		return [];
	}
}
