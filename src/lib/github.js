import { Octokit } from '@octokit/rest'

let _octokit = null

export function initOctokit(pat) {
  _octokit = new Octokit({ auth: pat })
}

function octokit() {
  if (!_octokit) throw new Error('Octokit not initialized')
  return _octokit
}

const META_RE = /<!--\s*meta\s*\n([\s\S]*?)-->/

export function parseBody(body) {
  if (!body) return {}
  const match = body.match(META_RE)
  if (!match) return {}
  const meta = {}
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const k = line.slice(0, idx).trim()
    const v = line.slice(idx + 1).trim()
    if (k && v) meta[k] = v
  }
  return meta
}

export function buildBody(meta) {
  const lines = Object.entries(meta).map(([k, v]) => `${k}: ${v}`).join('\n')
  return `<!-- meta\n${lines}\n-->`
}

function getPersonFromLabels(labels) {
  const l = labels.find(l => l.name.startsWith('person:'))
  return l ? l.name.slice('person:'.length) : ''
}

function getTrackerFromLabels(labels) {
  const l = labels.find(l => l.name.startsWith('tracker:'))
  return l ? l.name.slice('tracker:'.length) : ''
}

export function issueToItem(issue) {
  const meta = parseBody(issue.body)
  return {
    id: issue.number,
    description: issue.title,
    person: getPersonFromLabels(issue.labels),
    tracker: getTrackerFromLabels(issue.labels),
    askedDate: issue.created_at.split('T')[0],
    dueDate: meta.due || null,
    isDone: issue.state === 'closed',
    url: issue.html_url,
  }
}

export async function fetchIssues(owner, repo, tracker, state = 'open') {
  const oc = octokit()
  const items = []
  let page = 1
  while (true) {
    const { data } = await oc.issues.listForRepo({
      owner, repo,
      labels: `tracker:${tracker}`,
      state,
      per_page: 100,
      page,
    })
    const filtered = data.filter(i => !i.pull_request).map(issueToItem)
    items.push(...filtered)
    if (data.length < 100) break
    page++
  }
  return items
}

async function ensureLabel(owner, repo, name, color) {
  const oc = octokit()
  try {
    await oc.issues.getLabel({ owner, repo, name })
  } catch {
    try {
      await oc.issues.createLabel({ owner, repo, name, color })
    } catch {
      // label may have been created by a concurrent call
    }
  }
}

export async function createIssue(owner, repo, { description, person, tracker, dueDate }) {
  await ensureLabel(owner, repo, `tracker:${tracker}`, '0075ca')
  await ensureLabel(owner, repo, `person:${person}`, 'e4e669')
  const { data } = await octokit().issues.create({
    owner, repo,
    title: description,
    labels: [`tracker:${tracker}`, `person:${person}`],
    body: buildBody({ due: dueDate }),
  })
  return issueToItem(data)
}

export async function updateIssue(owner, repo, number, updates) {
  const oc = octokit()
  const patch = {}

  if (updates.description !== undefined) patch.title = updates.description
  if (updates.isDone !== undefined) patch.state = updates.isDone ? 'closed' : 'open'

  if (updates.dueDate !== undefined || updates.person !== undefined) {
    const { data: current } = await oc.issues.get({ owner, repo, issue_number: number })
    const meta = parseBody(current.body)
    if (updates.dueDate !== undefined) meta.due = updates.dueDate
    patch.body = buildBody(meta)

    if (updates.person !== undefined) {
      await ensureLabel(owner, repo, `person:${updates.person}`, 'e4e669')
      patch.labels = current.labels
        .map(l => l.name)
        .filter(l => !l.startsWith('person:'))
        .concat(`person:${updates.person}`)
    }
  }

  const { data } = await oc.issues.update({
    owner, repo,
    issue_number: number,
    ...patch,
  })
  return issueToItem(data)
}

export async function createTrackerLabel(owner, repo, tracker) {
  await ensureLabel(owner, repo, `tracker:${tracker}`, '0075ca')
}

export async function verifyAccess(owner, repo) {
  const { data } = await octokit().repos.get({ owner, repo })
  return data.full_name
}
