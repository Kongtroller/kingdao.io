import { useEffect, useState } from 'react'
import Link from 'next/link'

const SNAPSHOT_SPACE = 's:arbitrumfoundation.eth'
const SNAPSHOT_API = `https://api.snapshot.box/api/spaces/${SNAPSHOT_SPACE}/proposals?limit=50&sortBy=created&sortOrder=desc`

export default function SnapshotPage() {
  const [activeProposal, setActiveProposal] = useState(null)
  const [closedProposal, setClosedProposal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSnapshotData = async () => {
      try {
        const res = await fetch(SNAPSHOT_API)
        const data = await res.json()

        if (!data.items || data.items.length === 0) {
          console.warn('No proposals found for this space.')
          setLoading(false)
          return
        }

        const proposals = data.items

        const active = proposals.find(p => p.state === 'active')
        const closed = proposals
          .filter(p => p.state === 'closed')
          .sort((a, b) => b.end - a.end)[0]

        setActiveProposal(active || null)
        setClosedProposal(closed || null)
      } catch (err) {
        console.error('Error fetching Snapshot X data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSnapshotData()
  }, [])

  return (
    <div className="p-6 py-16 sm:py-24 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">🧠 K.I.N.G. Governance</h1>

      {loading ? (
        <p className="text-gray-500">Loading Snapshot X data...</p>
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
                href={`https://snapshot.box/#/s:${SNAPSHOT_SPACE}/proposal/${activeProposal.proposalId}`}
                className="text-blue-600 mt-2 inline-block hover:underline"
              >
                View on Snapshot →
              </Link>
            </div>
          ) : (
            <p className="text-gray-600 mb-8">No active proposals right now.</p>
          )}

          {/* Last Closed Proposal */}
          {closedProposal ? (
            <div className="bg-gray-100 rounded-2xl shadow-inner p-6">
              <h2 className="text-xl font-semibold mb-4">📊 Last Closed Proposal</h2>
              <p className="text-lg mb-2">{closedProposal.title}</p>
              <p className="text-sm text-gray-500 mb-4">
                {closedProposal.votes || 0} votes cast
              </p>

              {/* Voting results, if available */}
              {closedProposal.choices && closedProposal.scores?.length > 0 && (
                <div className="space-y-2">
                  {closedProposal.choices.map((choice, index) => {
                    const score = closedProposal.scores[index] || 0
                    const total = closedProposal.scores.reduce((a, b) => a + b, 0)
                    const percent = total ? ((score / total) * 100).toFixed(1) : 0

                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{choice}</span>
                          <span>{percent}% ({score.toLocaleString()} votes)</span>
                        </div>
                        <div className="w-full h-2 bg-gray-300 rounded">
                          <div
                            className="h-2 bg-green-500 rounded"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <Link
                href={`https://snapshot.box/#/s:${SNAPSHOT_SPACE}/proposal/${closedProposal.proposalId}`}
                className="text-blue-600 mt-4 inline-block hover:underline"
              >
                View full proposal →
              </Link>
            </div>
          ) : (
            <p className="text-gray-600">No closed proposals found.</p>
          )}
        </>
      )}
    </div>
  )
}