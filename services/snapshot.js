import fetch from 'node-fetch'

const SNAPSHOT_GRAPHQL = 'https://hub.snapshot.org/graphql'

export async function fetchProposals(space, limit = 5) {
  const body = {
    query: `
      query Proposals($space: String!, $limit: Int!) {
        proposals(
          first: $limit,
          where: { space: $space },
          orderBy: "created",
          orderDirection: desc
        ) {
          id
          title
          state
          author
          choices
          start
          end
        }
      }
    `,
    variables: { space, limit }
  }

  const res = await fetch(SNAPSHOT_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const { data } = await res.json()
  return data.proposals
}
