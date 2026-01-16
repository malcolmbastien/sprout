import { simpleGit } from 'simple-git';

const git = simpleGit();

export interface CommitInfo {
	date: string;
	message: string;
	hash: string;
	insertions: number;
	deletions: number;
}

// In-memory cache to avoid redundant git calls during build
const historyCache = new Map<string, CommitInfo[]>();
const datesCache = new Map<string, { created: Date | null, updated: Date | null }>();

export async function getFileHistory(filePath: string): Promise<CommitInfo[]> {
	if (historyCache.has(filePath)) {
		return historyCache.get(filePath)!;
	}

	try {
		// Optimization: Use a single git log command with stats to avoid multiple git show calls
		// This significantly improves performance for files with many commits
		const rawLog = await git.raw([
			'log',
			'--pretty=format:%H|%ad|%s',
			'--date=iso',
			'--stat',
			'--',
			filePath
		]);

		if (!rawLog) {
			return [];
		}

		const commits: CommitInfo[] = [];
		const sections = rawLog.split(/\n(?=[0-9a-f]{40}\|)/);

		for (const section of sections) {
			const lines = section.trim().split('\n');
			if (lines.length === 0) continue;

			const header = lines[0];
			const [hash, date, message] = header.split('|');

			let insertions = 0;
			let deletions = 0;

			// Look for the stat line (usually the last line of the section)
			const statLine = lines.find(l => l.includes('changed,') && (l.includes('insertion') || l.includes('deletion')));
			if (statLine) {
				const insMatch = statLine.match(/(\d+) insertion/);
				const delMatch = statLine.match(/(\d+) deletion/);
				if (insMatch) insertions = parseInt(insMatch[1]);
				if (delMatch) deletions = parseInt(delMatch[1]);
			}

			commits.push({
				hash,
				date,
				message,
				insertions,
				deletions
			});
		}

		historyCache.set(filePath, commits);
		return commits;
	} catch (error) {
		console.error(`Error fetching git history for ${filePath}:`, error);
		return [];
	}
}

export async function getFileDates(filePath: string): Promise<{ created: Date | null, updated: Date | null }> {
	if (datesCache.has(filePath)) {
		return datesCache.get(filePath)!;
	}

	try {
		// If we only need dates, we could use a faster command, 
		// but since PostHistory usually needs the full history anyway,
		// we leverage the history cache.
		const history = await getFileHistory(filePath);
		if (history.length === 0) {
			return { created: null, updated: null };
		}
		
		const result = {
			created: new Date(history[history.length - 1].date),
			updated: new Date(history[0].date),
		};
		
		datesCache.set(filePath, result);
		return result;
	} catch (error) {
		console.error(`Error fetching git dates for ${filePath}:`, error);
		return { created: null, updated: null };
	}
}

/**
 * Optimized batch fetch for all post dates.
	 * This is much faster than calling getFileDates individually for 100s of notes.
 */
export interface FileDates {
	created: Date;
	updated: Date;
	allDates: Set<string>; // ISO strings (YYYY-MM-DD)
}

let batchDatesCache: Map<string, FileDates> | null = null;

export async function getBatchFileDates(): Promise<Map<string, FileDates>> {
	if (batchDatesCache) return batchDatesCache;

	try {
		// Get all commits and files in src/content/notes
		// format: timestamp
		// file_path
		const raw = await git.raw([
			'log',
			'--format=%at',
			'--name-only',
			'--',
			'src/content/notes'
		]);

		const results = new Map<string, FileDates>();
		const lines = raw.split('\n');
		
		let currentTimestamp: number | null = null;

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;

			if (/^\d+$/.test(trimmed)) {
				currentTimestamp = parseInt(trimmed) * 1000;
			} else if (currentTimestamp && trimmed.startsWith('src/content/notes/')) {
				const filePath = trimmed;
				const date = new Date(currentTimestamp);
				const dateStr = date.toISOString().split('T')[0];
				
				const existing = results.get(filePath);
				if (!existing) {
					results.set(filePath, { 
						created: date, 
						updated: date, 
						allDates: new Set([dateStr]) 
					});
				} else {
					// Since git log is descending, the first one we see is the latest (updated)
					// and the last one we see is the earliest (created)
					if (date > existing.updated) existing.updated = date;
					if (date < existing.created) existing.created = date;
					existing.allDates.add(dateStr);
				}
			}
		}

		batchDatesCache = results;
		return results;
	} catch (error) {
		console.error('Error in batch fetching git dates:', error);
		return new Map();
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
		const log = await git.log(['--', 'src/content/notes/']);
		return log.all.map(commit => ({
			date: commit.date,
			message: commit.message,
			hash: commit.hash,
			insertions: 0,
			deletions: 0
		}));
	} catch (error) {
		console.error('Error fetching notes git commits:', error);
		return [];
	}
}
