export default async function handler(req, res) {
  const { queryId } = req.query

  if (!queryId) {
    return res.status(400).json({ error: 'Query ID is required' })
  }

  if (!process.env.DUNE_API_KEY) {
    return res.status(500).json({ error: 'DUNE_API_KEY is not configured' })
  }

  console.log('Dune API Request:', {
    queryId,
    apiKeyExists: !!process.env.DUNE_API_KEY,
    apiKeyLength: process.env.DUNE_API_KEY?.length,
    apiKey: process.env.DUNE_API_KEY?.substring(0, 4) + '...' // Show first 4 chars for verification
  })

  try {
    // First, execute the query to get latest results
    const executeUrl = `https://api.dune.com/api/v1/query/${queryId}/execute`  // Remove trailing slash
    console.log('Executing query:', executeUrl)
    
    const executeHeaders = {
      'X-Dune-API-Key': process.env.DUNE_API_KEY,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }

    // Execute the query
    const executeResponse = await fetch(executeUrl, {
      method: 'POST',
      headers: executeHeaders
    })

    if (!executeResponse.ok) {
      const errorText = await executeResponse.text()
      console.error('Execute error:', {
        status: executeResponse.status,
        body: errorText
      })
      return res.status(executeResponse.status).json({ 
        error: 'Failed to execute query',
        details: errorText
      })
    }

    const executeData = await executeResponse.json()
    const execution_id = executeData?.execution_id

    if (!execution_id) {
      return res.status(500).json({ 
        error: 'No execution ID returned',
        details: executeData
      })
    }

    console.log('Got execution_id:', execution_id)

    // Poll for results
    let status = 'QUERY_STATE_PENDING'
    let attempts = 0
    const MAX_ATTEMPTS = 30

    while ((status === 'QUERY_STATE_PENDING' || status === 'QUERY_STATE_EXECUTING') && attempts < MAX_ATTEMPTS) {
      attempts++
      const statusUrl = `https://api.dune.com/api/v1/execution/${execution_id}/status`
      
      const statusResponse = await fetch(statusUrl, {
        headers: executeHeaders
      })

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text()
        console.error('Status check error:', {
          status: statusResponse.status,
          body: errorText
        })
        return res.status(statusResponse.status).json({ 
          error: 'Failed to check query status',
          details: errorText
        })
      }

      const statusData = await statusResponse.json()
      status = statusData.state

      console.log('Query status:', status)

      if (status === 'QUERY_STATE_COMPLETED') {
        const resultsUrl = `https://api.dune.com/api/v1/execution/${execution_id}/results`
        
        const resultsResponse = await fetch(resultsUrl, {
          headers: executeHeaders
        })

        if (!resultsResponse.ok) {
          const errorText = await resultsResponse.text()
          console.error('Results error:', {
            status: resultsResponse.status,
            body: errorText
          })
          return res.status(resultsResponse.status).json({ 
            error: 'Failed to fetch results',
            details: errorText
          })
        }

        const results = await resultsResponse.json()
        return res.status(200).json(results)
      } 
      
      if (status === 'QUERY_STATE_FAILED') {
        return res.status(500).json({ 
          error: 'Query execution failed',
          details: statusData
        })
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    if (attempts >= MAX_ATTEMPTS) {
      return res.status(504).json({ error: 'Query execution timed out' })
    }

    return res.status(500).json({ error: 'Unknown error occurred' })
  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    })
  }
} 