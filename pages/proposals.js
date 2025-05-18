import { useEffect, useState } from 'react'
import Link from 'next/link'

const SNAPSHOT_SPACE = 'kongsdao.eth'
const SNAPSHOT_GRAPHQL_API = 'https://hub.snapshot.org/graphql'

export default function SnapshotPage() {
  const [activeProposal, setActiveProposal] = useState(null)
  const [recentClosedProposals, setRecentClosedProposals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSnapshotData = async () => {
      const query = `
        query {
          proposals(
            first: 10,
            where: { space_in: ["${SNAPSHOT_SPACE}"] },
            orderBy: "created",
            orderDirection: desc
          ) {
            id
            title
            state
            start
            end
            votes
            choices
            scores
            scores_total
          }
        }
      `

      try {
        const res = await fetch(SNAPSHOT_GRAPHQL_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        })

        const json = await res.json()
        const proposals = json.data?.proposals || []

        const active = proposals.find(p => p.state === 'active')
        const closed = proposals
          .filter(p => p.state === 'closed')
          .sort((a, b) => b.end - a.end)
          .slice(0, 3)

        setActiveProposal(active || null)
        setRecentClosedProposals(closed)
      } catch (err) {
        console.error('Snapshot GraphQL error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSnapshotData()
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-6 pt-32 pb-12">

      

      {loading ? (
        <p className="text-gray-500">Loading proposals...</p>
      ) : (
        <>
          {/* Active Proposal */}
          {activeProposal ? (
            <div className="bg-white rounded-2xl shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-2">🟢 Active Proposal</h2>
              <p className="text-lg">{activeProposal.title}</p>
              <p className="text-sm text-gray-500">
                Ends: {new Date(activeProposal.end * 1000).toLocaleString()}
              </p>
              <Link
                href={`https://snapshot.org/#/${SNAPSHOT_SPACE}/proposal/${activeProposal.id}`}
                className="text-blue-600 mt-2 inline-block hover:underline"
              >
                View on Snapshot →
              </Link>
            </div>
          ) : (
            <p className="text-gray-600 mb-8">No active proposals found.</p>
          )}

          {/* Closed Proposals */}
          <div>
            <h2 className="text-xl font-bold mb-4">📜 Recent Proposals</h2>
            {recentClosedProposals.length === 0 ? (
              <p className="text-gray-600">No closed proposals found.</p>
            ) : (
              recentClosedProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="bg-gray-50 rounded-xl shadow p-5 mb-6"
                >
                  <h3 className="text-lg font-semibold mb-1">{proposal.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Ended: {new Date(proposal.end * 1000).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    🧮 Total Votes: {proposal.votes.toLocaleString()} — 🧠 Voting Power: {proposal.scores_total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>

                  {proposal.choices && proposal.scores?.length > 0 && (
                    <div className="space-y-2">
                      {proposal.choices.map((choice, i) => {
                        const score = proposal.scores[i] || 0
                        const percent = proposal.scores_total
                          ? ((score / proposal.scores_total) * 100).toFixed(1)
                          : 0

                        return (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{choice}</span>
                              <span>{percent}% ({score.toLocaleString(undefined, { maximumFractionDigits: 2 })})</span>
                            </div>
                            <div className="w-full h-2 bg-gray-300 rounded">
                              <div
                                className="h-2 bg-indigo-500 rounded"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <Link
                    href={`https://snapshot.org/#/${SNAPSHOT_SPACE}/proposal/${proposal.id}`}
                    className="text-blue-600 mt-3 inline-block hover:underline"
                  >
                    View full proposal →
                  </Link>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
